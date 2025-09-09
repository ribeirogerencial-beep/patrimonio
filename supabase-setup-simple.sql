-- =====================================================
-- SCRIPT SIMPLES PARA SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. HABILITAR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CRIAR TABELAS
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    taxa_depreciacao DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS localizacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    responsavel VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pessoas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(30),
    cpf VARCHAR(20),
    tipo VARCHAR(30) DEFAULT 'funcionario',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ativos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria_id UUID REFERENCES categorias(id),
    localizacao_id UUID REFERENCES localizacoes(id),
    setor_id UUID REFERENCES setores(id),
    valor_aquisicao DECIMAL(15,2) NOT NULL,
    data_aquisicao DATE NOT NULL,
    vida_util INTEGER,
    valor_residual DECIMAL(15,2),
    status VARCHAR(30) DEFAULT 'ativo',
    numero_serie VARCHAR(255),
    numero_patrimonio VARCHAR(255),
    fornecedor VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS depreciacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ativo_id UUID REFERENCES ativos(id),
    valor_depreciacao DECIMAL(15,2) NOT NULL,
    valor_contabil DECIMAL(15,2) NOT NULL,
    data_calculo DATE NOT NULL,
    periodo VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manutencoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ativo_id UUID REFERENCES ativos(id),
    tipo VARCHAR(30) NOT NULL,
    descricao TEXT NOT NULL,
    data_agendada DATE,
    data_realizada DATE,
    custo DECIMAL(15,2),
    responsavel VARCHAR(255),
    status VARCHAR(30) DEFAULT 'agendada',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alugueis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ativo_id UUID REFERENCES ativos(id),
    locatario_id UUID REFERENCES pessoas(id),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    valor_mensal DECIMAL(15,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'ativo',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_ativos_categoria ON ativos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ativos_localizacao ON ativos(localizacao_id);
CREATE INDEX IF NOT EXISTS idx_ativos_setor ON ativos(setor_id);
CREATE INDEX IF NOT EXISTS idx_ativos_status ON ativos(status);

-- 4. FUNÇÃO PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. TRIGGERS
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_localizacoes_updated_at BEFORE UPDATE ON localizacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON setores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ativos_updated_at BEFORE UPDATE ON ativos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_depreciacoes_updated_at BEFORE UPDATE ON depreciacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manutencoes_updated_at BEFORE UPDATE ON manutencoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alugueis_updated_at BEFORE UPDATE ON alugueis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. ROW LEVEL SECURITY
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alugueis ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS
CREATE POLICY "Permitir todas as operações" ON categorias FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON localizacoes FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON setores FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON pessoas FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON ativos FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON depreciacoes FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON manutencoes FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações" ON alugueis FOR ALL USING (true);

-- 8. TEMPO REAL
ALTER PUBLICATION supabase_realtime ADD TABLE categorias;
ALTER PUBLICATION supabase_realtime ADD TABLE localizacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE setores;
ALTER PUBLICATION supabase_realtime ADD TABLE pessoas;
ALTER PUBLICATION supabase_realtime ADD TABLE ativos;
ALTER PUBLICATION supabase_realtime ADD TABLE depreciacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE manutencoes;
ALTER PUBLICATION supabase_realtime ADD TABLE alugueis;


