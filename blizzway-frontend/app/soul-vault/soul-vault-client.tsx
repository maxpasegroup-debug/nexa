"use client";

import { useEffect, useMemo, useState } from "react";

import { BlizzwayBadge, BlizzwayButton, BlizzwayCard, BlizzwayEmptyState, BlizzwayGradientPanel } from "@/components/blizzway";
import { getApiErrorMessage, soulVaultApi, type BlizzwayDocument, type SoulVaultResponse } from "@/lib/api";
import { BlizzwayDashboardShell } from "../dashboard-shell";

function asStringRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string>)
    : {};
}

export function SoulVaultClient() {
  const [data, setData] = useState<SoulVaultResponse | null>(null);
  const [documents, setDocuments] = useState<BlizzwayDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<BlizzwayDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentBusy, setDocumentBusy] = useState("");
  const [error, setError] = useState("");
  const [documentNotice, setDocumentNotice] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("resume");

  async function loadDocuments() {
    const response = await soulVaultApi.getDocuments();
    setDocuments(response.documents);
    setSelectedDocument((current) => current ? response.documents.find((item) => item.id === current.id) ?? null : response.documents[0] ?? null);
  }

  useEffect(() => {
    let active = true;

    async function loadVault() {
      setLoading(true);
      setError("");
      try {
        const [vaultResponse, documentsResponse] = await Promise.all([
          soulVaultApi.getSoulVault(),
          soulVaultApi.getDocuments(),
        ]);
        if (active) {
          setData(vaultResponse);
          setDocuments(documentsResponse.documents);
          setSelectedDocument(documentsResponse.documents[0] ?? null);
        }
      } catch (caught) {
        if (active) setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadVault();

    return () => {
      active = false;
    };
  }, []);

  const vault = data?.vault;
  const answers = asStringRecord(vault?.onboardingAnswers);
  const memories = useMemo(() => {
    if (!vault) return [];

    return [
      ...Object.entries(answers).map(([type, text]) => [type, text] as const),
      ...(vault.dreamGoals ?? []).map((goal) => ["Goal", goal] as const),
    ];
  }, [answers, vault]);
  const board = vault?.visionBoard
    ? [
        ["6 months", vault.visionBoard.sixMonths],
        ["1 year", vault.visionBoard.oneYear],
        ["3 years", vault.visionBoard.threeYears],
        ["5 years", vault.visionBoard.fiveYears],
      ].filter(([, value]) => Boolean(value))
    : [];
  const hasVaultData = Boolean(vault?.vaultItems.length || memories.length || board.length);

  async function uploadDocument() {
    if (!uploadFile) {
      setDocumentNotice("Choose a document before uploading.");
      return;
    }

    if (uploadFile.size > 8 * 1024 * 1024) {
      setDocumentNotice("This document is above the 8 MB beta limit.");
      return;
    }

    setDocumentBusy("upload");
    setDocumentNotice("");
    try {
      const formData = new FormData();
      formData.set("file", uploadFile);
      formData.set("documentType", documentType);
      const response = await soulVaultApi.uploadDocument(formData);
      setUploadFile(null);
      setSelectedDocument(response.document);
      await loadDocuments();
      setDocumentNotice("Document uploaded privately. Parse it when you are ready.");
    } catch (caught) {
      setDocumentNotice(getApiErrorMessage(caught));
    } finally {
      setDocumentBusy("");
    }
  }

  async function parseSelectedDocument() {
    if (!selectedDocument) return;
    setDocumentBusy(`parse-${selectedDocument.id}`);
    setDocumentNotice("");
    try {
      const response = await soulVaultApi.parseDocument(selectedDocument.id);
      setSelectedDocument(response.document);
      await loadDocuments();
      setDocumentNotice(response.document.status === "parsed" ? "Document parsed and ready for BDP/companions." : response.document.parsedSummary || "Document stored. Parsing is pending.");
    } catch (caught) {
      setDocumentNotice(getApiErrorMessage(caught));
    } finally {
      setDocumentBusy("");
    }
  }

  async function applySelectedToBdp() {
    if (!selectedDocument) return;
    setDocumentBusy(`bdp-${selectedDocument.id}`);
    setDocumentNotice("");
    try {
      const response = await soulVaultApi.applyDocumentToBdp(selectedDocument.id);
      setDocumentNotice(`BDP suggestions updated. Profile strength is now ${response.bdp.profileStrength}%.`);
    } catch (caught) {
      setDocumentNotice(getApiErrorMessage(caught));
    } finally {
      setDocumentBusy("");
    }
  }

  async function deleteSelectedDocument() {
    if (!selectedDocument) return;
    setDocumentBusy(`delete-${selectedDocument.id}`);
    setDocumentNotice("");
    try {
      await soulVaultApi.deleteDocument(selectedDocument.id);
      setSelectedDocument(null);
      await loadDocuments();
      setDocumentNotice("Document archived and removed from private storage.");
    } catch (caught) {
      setDocumentNotice(getApiErrorMessage(caught));
    } finally {
      setDocumentBusy("");
    }
  }

  return (
    <BlizzwayDashboardShell
      activeHref="/soul-vault"
      title="Soul Vault"
      description="A private profile for dreams, reflections, growth memory, and vision boards."
    >
      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Secure vault messaging</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Your confidence deserves a home.</h2>
          <p className="mt-4 leading-7 text-white/72">
            Vault content remembers dreams, proof, and becoming inside your Blizzway-scoped BGOS workspace.
          </p>
          <div className="mt-6 rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
            <p className="font-black">Private by tenant scope</p>
            <p className="mt-2 text-sm text-white/70">Designed for growth notes and reflections. Keep passwords, payment details, and official identity numbers outside your vault.</p>
          </div>
        </BlizzwayGradientPanel>
        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Private profile</p>
          {loading ? (
            <div className="mt-5 h-32 animate-pulse rounded-2xl bg-slate-100" />
          ) : hasVaultData ? (
            <>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{vault?.digitalProfile?.stage || "Blizzway Explorer"}</h2>
              <p className="mt-3 text-sm leading-6 c7-muted">{vault?.digitalProfile?.summary || "No profile summary saved yet."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(vault?.digitalProfile?.strengths ?? ["Hopeful", "Focused", "Premium path"]).map((item) => (
                  <BlizzwayBadge key={item} tone="slate">{item}</BlizzwayBadge>
                ))}
              </div>
            </>
          ) : (
            <BlizzwayEmptyState
              title="Soul Vault is empty"
              description="Complete onboarding to save your profile, dream goals, and vision board."
              actionLabel="Start onboarding"
              actionHref="/onboarding"
            />
          )}
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.78fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Dreams, goals, reflections</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)
            ) : memories.length ? (
              memories.map(([type, text]) => (
                <div key={`${type}-${text}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <BlizzwayBadge tone="cyan">{type}</BlizzwayBadge>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{text}</p>
                </div>
              ))
            ) : (
              <BlizzwayEmptyState title="No memories saved yet" description="Onboarding answers and dream goals will appear here." />
            )}
          </div>
        </BlizzwayCard>
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Vision board</p>
          <div className="mt-6 grid gap-3">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)
            ) : board.length ? (
              board.map(([time, item]) => (
                <div key={time} className="rounded-2xl bg-gradient-to-r from-indigo-50 to-cyan-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-600">{time}</p>
                  <p className="mt-2 font-black text-slate-950">{item}</p>
                </div>
              ))
            ) : (
              <BlizzwayEmptyState title="No vision board yet" description="Save a 6 month, 1 year, 3 year, and 5 year vision during onboarding." />
            )}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.56fr_1fr]">
        <BlizzwayCard as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Private document upload</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Add proof to Soul Vault</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            PDF, DOCX, TXT, PNG, and JPG are accepted up to 8 MB. TXT is parsed now; PDF/DOCX are stored safely until parser dependencies are enabled; images are OCR pending.
          </p>
          <div className="mt-5 grid gap-3">
            <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400">
              <option value="resume">Resume/CV</option>
              <option value="certificate">Certificate</option>
              <option value="marksheet">Mark sheet</option>
              <option value="transcript">Transcript</option>
              <option value="sop_draft">SOP draft</option>
              <option value="lor_draft">LOR draft</option>
              <option value="portfolio">Portfolio file</option>
              <option value="passport_id">Passport/ID placeholder</option>
              <option value="admission_document">Admission document</option>
              <option value="other">Other</option>
            </select>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700"
            />
            <BlizzwayButton type="button" onClick={uploadDocument} disabled={Boolean(documentBusy)} variant="dark">
              {documentBusy === "upload" ? "Uploading..." : "Upload privately"}
            </BlizzwayButton>
          </div>
          {documentNotice ? <p className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-800">{documentNotice}</p> : null}
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Document vault</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">Uploaded documents</h2>
            </div>
            <BlizzwayBadge tone="slate">{documents.length} private</BlizzwayBadge>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="grid max-h-[460px] gap-3 overflow-y-auto pr-1">
              {loading ? (
                [0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)
              ) : documents.length ? (
                documents.map((document) => (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => setSelectedDocument(document)}
                    className={`rounded-2xl border p-4 text-left transition ${selectedDocument?.id === document.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
                  >
                    <p className="truncate text-sm font-black text-slate-950">{document.originalFilename}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <BlizzwayBadge tone="cyan">{document.documentType.replace(/_/g, " ")}</BlizzwayBadge>
                      <BlizzwayBadge tone={document.status === "parsed" ? "emerald" : document.status === "failed" ? "purple" : "slate"}>{document.status}</BlizzwayBadge>
                    </div>
                  </button>
                ))
              ) : (
                <BlizzwayEmptyState title="No documents yet" description="Upload a resume, certificate, transcript, SOP, LOR, or admissions file." />
              )}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              {selectedDocument ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Private preview</p>
                  <h3 className="mt-3 break-words text-xl font-black text-slate-950">{selectedDocument.originalFilename}</h3>
                  <p className="mt-2 text-sm font-semibold c7-muted">{Math.ceil(selectedDocument.size / 1024)} KB · {selectedDocument.mimeType}</p>
                  <p className="mt-4 text-sm font-bold leading-6 text-slate-700">{selectedDocument.parsedSummary || "Not parsed yet. Parse TXT files now, or keep PDF/DOCX/images stored privately for later extraction."}</p>
                  {selectedDocument.parsedTextPreview ? (
                    <div className="mt-4 max-h-40 overflow-y-auto rounded-2xl bg-white p-4 text-xs font-semibold leading-5 text-slate-600">
                      {selectedDocument.parsedTextPreview}
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <BlizzwayButton type="button" onClick={parseSelectedDocument} disabled={Boolean(documentBusy)} variant="secondary">
                      {documentBusy === `parse-${selectedDocument.id}` ? "Parsing..." : "Parse document"}
                    </BlizzwayButton>
                    <BlizzwayButton type="button" onClick={applySelectedToBdp} disabled={Boolean(documentBusy) || selectedDocument.status !== "parsed"} variant="dark">
                      Apply to BDP
                    </BlizzwayButton>
                    <button type="button" onClick={deleteSelectedDocument} disabled={Boolean(documentBusy)} className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-black text-rose-700 disabled:opacity-50">
                      Archive
                    </button>
                  </div>
                  <p className="mt-4 text-xs font-bold leading-5 text-slate-500">No public file URL is exposed. Access is limited to your authenticated Blizzway workspace.</p>
                </>
              ) : (
                <BlizzwayEmptyState title="Select a document" description="Upload or select a file to view private parsing status and BDP actions." />
              )}
            </div>
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
