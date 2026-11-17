-- Base de exemplo do laboratório SQL Moderno: uma loja de cafés.
CREATE TABLE produtos (
    id         integer PRIMARY KEY,
    nome       text NOT NULL,
    categoria  text NOT NULL,
    preco      numeric(10, 2) NOT NULL CHECK (preco > 0)
);

CREATE TABLE clientes (
    id             integer PRIMARY KEY,
    nome           text NOT NULL,
    cidade         text,
    uf             char(2),
    data_cadastro  date NOT NULL,
    segmento       text NOT NULL,
    indicado_por   integer REFERENCES clientes (id)
);

CREATE TABLE pedidos (
    id          integer PRIMARY KEY,
    cliente_id  integer NOT NULL REFERENCES clientes (id),
    criado_em   timestamp NOT NULL,
    status      text NOT NULL,
    canal       text NOT NULL
);

CREATE TABLE itens_pedido (
    pedido_id       integer NOT NULL REFERENCES pedidos (id),
    produto_id      integer NOT NULL REFERENCES produtos (id),
    quantidade      integer NOT NULL CHECK (quantidade > 0),
    preco_unitario  numeric(10, 2) NOT NULL,
    PRIMARY KEY (pedido_id, produto_id)
);

CREATE INDEX ON pedidos (cliente_id);
CREATE INDEX ON pedidos (criado_em);
CREATE INDEX ON itens_pedido (produto_id);
