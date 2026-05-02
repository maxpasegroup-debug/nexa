UPDATE "MarketplaceAgent"
SET "agentType" = 'BACKGROUND'
WHERE "agentType" IS DISTINCT FROM 'BACKGROUND';
