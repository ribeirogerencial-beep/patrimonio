-- =====================================================
-- DADOS INICIAIS PARA SUPABASE
-- Execute APÓS executar o script principal
-- =====================================================

-- Categorias padrão
INSERT INTO categorias (nome, descricao, taxa_depreciacao) VALUES
('Equipamentos de Informática', 'Computadores, notebooks, tablets, servidores', 20.00),
('Móveis e Utensílios', 'Mesas, cadeiras, armários, estantes', 10.00),
('Veículos', 'Carros, motos, caminhões, vans', 20.00),
('Máquinas e Equipamentos', 'Maquinário industrial, ferramentas', 10.00),
('Imóveis', 'Prédios, terrenos, construções', 4.00),
('Equipamentos de Escritório', 'Impressoras, scanners, telefones', 15.00),
('Equipamentos de Laboratório', 'Instrumentos, equipamentos científicos', 12.00),
('Equipamentos de Segurança', 'Câmeras, alarmes, sistemas de segurança', 15.00)
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


