-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA DO SUPABASE
-- Controle de Ativo Imobilizado
-- =====================================================

-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CRIAR TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    taxa_depreciacao DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de localizações
CREATE TABLE IF NOT EXISTS localizacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de setores
CREATE TABLE IF NOT EXISTS setores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    responsavel VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pessoas (funcionários, fornecedores, clientes)
CREATE TABLE IF NOT EXISTS pessoas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(30),
    cpf VARCHAR(20),
    tipo VARCHAR(30) DEFAULT 'funcionario' CHECK (tipo IN ('funcionario', 'fornecedor', 'cliente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de ativos
CREATE TABLE IF NOT EXISTS ativos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    localizacao_id UUID REFERENCES localizacoes(id) ON DELETE SET NULL,
    setor_id UUID REFERENCES setores(id) ON DELETE SET NULL,
    valor_aquisicao DECIMAL(15,2) NOT NULL,
    data_aquisicao DATE NOT NULL,
    vida_util INTEGER, -- em meses
    valor_residual DECIMAL(15,2),
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'baixado', 'manutencao')),
    numero_serie VARCHAR(255),
    numero_patrimonio VARCHAR(255),
    fornecedor VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de depreciações
CREATE TABLE IF NOT EXISTS depreciacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ativo_id UUID REFERENCES ativos(id) ON DELETE CASCADE,
    valor_depreciacao DECIMAL(15,2) NOT NULL,
    valor_contabil DECIMAL(15,2) NOT NULL,
    data_calculo DATE NOT NULL,
    periodo VARCHAR(7) NOT NULL, -- formato YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de manutenções
CREATE TABLE IF NOT EXISTS manutencoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ativo_id UUID REFERENCES ativos(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('preventiva', 'corretiva', 'preditiva')),
    descricao TEXT NOT NULL,
    data_agendada DATE,
    data_realizada DATE,
    custo DECIMAL(15,2),
    responsavel VARCHAR(255),
    status VARCHAR(30) DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de aluguéis
CREATE TABLE IF NOT EXISTS alugueis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ativo_id UUID REFERENCES ativos(id) ON DELETE CASCADE,
    locatario_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    valor_mensal DECIMAL(15,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ativos_categoria ON ativos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ativos_localizacao ON ativos(localizacao_id);
CREATE INDEX IF NOT EXISTS idx_ativos_setor ON ativos(setor_id);
CREATE INDEX IF NOT EXISTS idx_ativos_status ON ativos(status);
CREATE INDEX IF NOT EXISTS idx_ativos_data_aquisicao ON ativos(data_aquisicao);
CREATE INDEX IF NOT EXISTS idx_depreciacoes_ativo ON depreciacoes(ativo_id);
CREATE INDEX IF NOT EXISTS idx_depreciacoes_periodo ON depreciacoes(periodo);
CREATE INDEX IF NOT EXISTS idx_manutencoes_ativo ON manutencoes(ativo_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_status ON manutencoes(status);
CREATE INDEX IF NOT EXISTS idx_manutencoes_data_agendada ON manutencoes(data_agendada);
CREATE INDEX IF NOT EXISTS idx_alugueis_ativo ON alugueis(ativo_id);
CREATE INDEX IF NOT EXISTS idx_alugueis_locatario ON alugueis(locatario_id);
CREATE INDEX IF NOT EXISTS idx_alugueis_status ON alugueis(status);

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CRIAR TRIGGERS PARA updated_at
-- =====================================================
CREATE TRIGGER update_categorias_updated_at 
    BEFORE UPDATE ON categorias 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_localizacoes_updated_at 
    BEFORE UPDATE ON localizacoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_setores_updated_at 
    BEFORE UPDATE ON setores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pessoas_updated_at 
    BEFORE UPDATE ON pessoas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ativos_updated_at 
    BEFORE UPDATE ON ativos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_depreciacoes_updated_at 
    BEFORE UPDATE ON depreciacoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manutencoes_updated_at 
    BEFORE UPDATE ON manutencoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alugueis_updated_at 
    BEFORE UPDATE ON alugueis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. INSERIR DADOS INICIAIS
-- =====================================================

-- Categorias padrão
INSERT INTO categorias (nome, descricao, taxa_depreciacao) VALUES
('Equipamentos de Informática', 'Computadores, notebooks, tablets, servidores, etc.', 20.00),
('Móveis e Utensílios', 'Mesas, cadeiras, armários, estantes, etc.', 10.00),
('Veículos', 'Carros, motos, caminhões, vans, etc.', 20.00),
('Máquinas e Equipamentos', 'Maquinário industrial, ferramentas, equipamentos de produção, etc.', 10.00),
('Imóveis', 'Prédios, terrenos, construções, reformas, etc.', 4.00),
('Equipamentos de Escritório', 'Impressoras, scanners, telefones, etc.', 15.00),
('Equipamentos de Laboratório', 'Instrumentos, equipamentos científicos, etc.', 12.00),
('Equipamentos de Segurança', 'Câmeras, alarmes, sistemas de segurança, etc.', 15.00)
ON CONFLICT DO NOTHING;

-- Localizações padrão
INSERT INTO localizacoes (nome, descricao, endereco) VALUES
('Sede Principal', 'Escritório principal da empresa', 'Rua Principal, 123 - Centro'),
('Filial Norte', 'Filial da região norte', 'Av. Norte, 456 - Zona Norte'),
('Filial Sul', 'Filial da região sul', 'Rua Sul, 789 - Zona Sul'),
('Depósito Central', 'Armazém principal', 'Rua Industrial, 101 - Distrito Industrial'),
('Laboratório', 'Laboratório de pesquisa e desenvolvimento', 'Rua Científica, 202 - Parque Tecnológico'),
('Oficina', 'Oficina de manutenção', 'Rua Técnica, 303 - Zona Industrial')
ON CONFLICT DO NOTHING;

-- Setores padrão
INSERT INTO setores (nome, descricao, responsavel) VALUES
('TI', 'Tecnologia da Informação', 'João Silva'),
('Administrativo', 'Setor administrativo e financeiro', 'Maria Santos'),
('Produção', 'Setor de produção e operações', 'Pedro Costa'),
('Vendas', 'Setor comercial e vendas', 'Ana Oliveira'),
('RH', 'Recursos Humanos', 'Carlos Mendes'),
('Marketing', 'Marketing e comunicação', 'Lucia Ferreira'),
('Pesquisa e Desenvolvimento', 'P&D e inovação', 'Roberto Alves'),
('Manutenção', 'Manutenção e suporte técnico', 'Fernando Lima')
ON CONFLICT DO NOTHING;

-- Pessoas de exemplo
INSERT INTO pessoas (nome, email, telefone, cpf, tipo) VALUES
('João Silva', 'joao.silva@empresa.com', '(11) 99999-1111', '123.456.789-01', 'funcionario'),
('Maria Santos', 'maria.santos@empresa.com', '(11) 99999-2222', '123.456.789-02', 'funcionario'),
('Pedro Costa', 'pedro.costa@empresa.com', '(11) 99999-3333', '123.456.789-03', 'funcionario'),
('Ana Oliveira', 'ana.oliveira@empresa.com', '(11) 99999-4444', '123.456.789-04', 'funcionario'),
('Tech Solutions Ltda', 'contato@techsolutions.com', '(11) 3333-5555', '12.345.678/0001-90', 'fornecedor'),
('Office Supplies Corp', 'vendas@officesupplies.com', '(11) 3333-6666', '12.345.678/0001-91', 'fornecedor'),
('Cliente ABC Ltda', 'compras@clienteabc.com', '(11) 3333-7777', '12.345.678/0001-92', 'cliente')
ON CONFLICT DO NOTHING;

-- 7. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alugueis ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todas as operações (ajuste conforme necessário)
CREATE POLICY "Permitir todas as operações" ON categorias FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON localizacoes FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON setores FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON pessoas FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON ativos FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON depreciacoes FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON manutencoes FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON alugueis FOR ALL USING (true);

-- 8. ATIVAR TEMPO REAL (REALTIME)
-- =====================================================

-- Ativar tempo real para todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE categorias;
ALTER PUBLICATION supabase_realtime ADD TABLE localizacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE setores;
ALTER PUBLICATION supabase_realtime ADD TABLE pessoas;
ALTER PUBLICATION supabase_realtime ADD TABLE ativos;
ALTER PUBLICATION supabase_realtime ADD TABLE depreciacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE manutencoes;
ALTER PUBLICATION supabase_realtime ADD TABLE alugueis;

-- 9. COMENTÁRIOS DAS TABELAS
-- =====================================================
COMMENT ON TABLE categorias IS 'Categorias de ativos com taxas de depreciação';
COMMENT ON TABLE localizacoes IS 'Localizações físicas dos ativos';
COMMENT ON TABLE setores IS 'Setores organizacionais da empresa';
COMMENT ON TABLE pessoas IS 'Pessoas: funcionários, fornecedores e clientes';
COMMENT ON TABLE ativos IS 'Ativos imobilizados da empresa';
COMMENT ON TABLE depreciacoes IS 'Registro de depreciações calculadas';
COMMENT ON TABLE manutencoes IS 'Agenda e histórico de manutenções';
COMMENT ON TABLE alugueis IS 'Contratos de aluguel de ativos';

-- 10. VERIFICAÇÃO FINAL
-- =====================================================
-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'categorias', 'localizacoes', 'setores', 'pessoas', 
        'ativos', 'depreciacoes', 'manutencoes', 'alugueis'
    )
ORDER BY tablename;

-- Verificar se o tempo real está ativo
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =====================================================
-- SCRIPT CONCLUÍDO!
-- =====================================================
