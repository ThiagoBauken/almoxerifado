-- ========================================
-- Fix: Assign users without organization_id to default organization
-- ========================================

BEGIN;

-- Create default organization if it doesn't exist
INSERT INTO organizations (nome, slug, plano, max_usuarios, max_itens)
VALUES ('Organização Padrão', 'default', 'free', 999, 999)
ON CONFLICT (slug) DO NOTHING;

-- Get the ID of the default organization
DO $$
DECLARE
    default_org_id INTEGER;
BEGIN
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default';

    -- Update users without organization_id
    UPDATE users
    SET organization_id = default_org_id
    WHERE organization_id IS NULL;

    -- Update items without organization_id
    UPDATE items
    SET organization_id = default_org_id
    WHERE organization_id IS NULL
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'organization_id');

    -- Update categories without organization_id
    UPDATE categories
    SET organization_id = default_org_id
    WHERE organization_id IS NULL
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'organization_id');

    -- Update obras without organization_id
    UPDATE obras
    SET organization_id = default_org_id
    WHERE organization_id IS NULL
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'organization_id');

    -- Update locais_armazenamento without organization_id
    UPDATE locais_armazenamento
    SET organization_id = default_org_id
    WHERE organization_id IS NULL
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locais_armazenamento' AND column_name = 'organization_id');

    RAISE NOTICE 'Users, items, categories, obras e locais_armazenamento atualizados com sucesso!';
END $$;

COMMIT;

-- Verify the fix
SELECT COUNT(*) as users_without_org FROM users WHERE organization_id IS NULL;
SELECT COUNT(*) as users_with_org FROM users WHERE organization_id IS NOT NULL;
