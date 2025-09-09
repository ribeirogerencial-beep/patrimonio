-- Schema do banco de dados para Controle de Ativo Imobilizado
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    telefone VARCHAR(20),
    cpf VARCHAR(14),
    tipo VARCHAR(20) DEFAULT 'funcionario' CHECK (tipo IN ('funcionario', 'fornecedor', 'cliente')),
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
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'baixado', 'manutencao')),
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
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('preventiva', 'corretiva', 'preditiva')),
    descricao TEXT NOT NULL,
    data_agendada DATE,
    data_realizada DATE,
    custo DECIMAL(15,2),
    responsavel VARCHAR(255),
    status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
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
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ativos_categoria ON ativos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ativos_localizacao ON ativos(localizacao_id);
CREATE INDEX IF NOT EXISTS idx_ativos_setor ON ativos(setor_id);
CREATE INDEX IF NOT EXISTS idx_ativos_status ON ativos(status);
CREATE INDEX IF NOT EXISTS idx_depreciacoes_ativo ON depreciacoes(ativo_id);
CREATE INDEX IF NOT EXISTS idx_depreciacoes_periodo ON depreciacoes(periodo);
CREATE INDEX IF NOT EXISTS idx_manutencoes_ativo ON manutencoes(ativo_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_status ON manutencoes(status);
CREATE INDEX IF NOT EXISTS idx_alugueis_ativo ON alugueis(ativo_id);
CREATE INDEX IF NOT EXISTS idx_alugueis_locatario ON alugueis(locatario_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_localizacoes_updated_at BEFORE UPDATE ON localizacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON setores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ativos_updated_at BEFORE UPDATE ON ativos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_depreciacoes_updated_at BEFORE UPDATE ON depreciacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manutencoes_updated_at BEFORE UPDATE ON manutencoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alugueis_updated_at BEFORE UPDATE ON alugueis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais
INSERT INTO categorias (nome, descricao, taxa_depreciacao) VALUES
('Equipamentos de Informática', 'Computadores, notebooks, tablets, etc.', 20.00),
('Móveis e Utensílios', 'Mesas, cadeiras, armários, etc.', 10.00),
('Veículos', 'Carros, motos, caminhões, etc.', 20.00),
('Máquinas e Equipamentos', 'Maquinário industrial, ferramentas, etc.', 10.00),
('Imóveis', 'Prédios, terrenos, construções, etc.', 4.00)
ON CONFLICT DO NOTHING;

INSERT INTO localizacoes (nome, descricao, endereco) VALUES
('Sede Principal', 'Escritório principal da empresa', 'Rua Principal, 123 - Centro'),
('Filial Norte', 'Filial da região norte', 'Av. Norte, 456 - Zona Norte'),
('Depósito Central', 'Armazém principal', 'Rua Industrial, 789 - Distrito Industrial')
ON CONFLICT DO NOTHING;

INSERT INTO setores (nome, descricao, responsavel) VALUES
('TI', 'Tecnologia da Informação', 'João Silva'),
('Administrativo', 'Setor administrativo', 'Maria Santos'),
('Produção', 'Setor de produção', 'Pedro Costa'),
('Vendas', 'Setor comercial', 'Ana Oliveira')
ON CONFLICT DO NOTHING;

-- Políticas de segurança (RLS)
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

