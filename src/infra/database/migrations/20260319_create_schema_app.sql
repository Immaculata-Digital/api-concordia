--
-- PostgreSQL database dump
--

\restrict uJsok6XIyg37GipyGgz7b9Fh4v3i7VBP0OZ3Xh9tCyFUBg6wvgaUjwW6v5RpEJB

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-19 14:30:53 -03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 10 (class 2615 OID 29640)
-- Name: app; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA app;


ALTER SCHEMA app OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 434 (class 1259 OID 53033)
-- Name: academia_questionario_templates; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.academia_questionario_templates (
    uuid uuid NOT NULL,
    tenant_id uuid,
    tipo character varying(50) NOT NULL,
    perguntas jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE app.academia_questionario_templates OWNER TO postgres;

--
-- TOC entry 337 (class 1259 OID 29706)
-- Name: access_group_memberships; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.access_group_memberships (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    group_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.access_group_memberships OWNER TO postgres;

--
-- TOC entry 336 (class 1259 OID 29705)
-- Name: access_group_memberships_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.access_group_memberships_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.access_group_memberships_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4687 (class 0 OID 0)
-- Dependencies: 336
-- Name: access_group_memberships_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.access_group_memberships_seq_id_seq OWNED BY app.access_group_memberships.seq_id;


--
-- TOC entry 335 (class 1259 OID 29683)
-- Name: access_groups; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.access_groups (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(120) NOT NULL,
    code character varying(100) NOT NULL,
    description text,
    features text[] DEFAULT '{}'::text[] NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    modules text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE app.access_groups OWNER TO postgres;

--
-- TOC entry 334 (class 1259 OID 29682)
-- Name: access_groups_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.access_groups_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.access_groups_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4688 (class 0 OID 0)
-- Dependencies: 334
-- Name: access_groups_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.access_groups_seq_id_seq OWNED BY app.access_groups.seq_id;


--
-- TOC entry 351 (class 1259 OID 29924)
-- Name: campanhas_disparo; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.campanhas_disparo (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    tipo character varying(50) DEFAULT 'email'::character varying NOT NULL,
    descricao text NOT NULL,
    assunto text NOT NULL,
    html text NOT NULL,
    remetente_id uuid,
    tipo_envio character varying(50) DEFAULT 'manual'::character varying NOT NULL,
    data_agendamento timestamp with time zone,
    status character varying(50) DEFAULT 'rascunho'::character varying NOT NULL,
    total_enviados integer DEFAULT 0,
    total_entregues integer DEFAULT 0,
    total_abertos integer DEFAULT 0,
    total_cliques integer DEFAULT 0,
    chave character varying(255),
    tipo_destinatario character varying(50) DEFAULT 'todos'::character varying,
    lojas_ids text,
    clientes_ids text,
    cliente_pode_excluir boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.campanhas_disparo OWNER TO postgres;

--
-- TOC entry 350 (class 1259 OID 29923)
-- Name: campanhas_disparo_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.campanhas_disparo_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.campanhas_disparo_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4689 (class 0 OID 0)
-- Dependencies: 350
-- Name: campanhas_disparo_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.campanhas_disparo_seq_id_seq OWNED BY app.campanhas_disparo.seq_id;


--
-- TOC entry 413 (class 1259 OID 30804)
-- Name: produtos_cardapio; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_cardapio (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    ordem integer DEFAULT 0 NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    tempo_preparo_min interval,
    tempo_preparo_max interval,
    exibir_tempo_preparo boolean DEFAULT true NOT NULL
);


ALTER TABLE app.produtos_cardapio OWNER TO postgres;

--
-- TOC entry 412 (class 1259 OID 30803)
-- Name: cardapio_itens_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.cardapio_itens_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.cardapio_itens_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4690 (class 0 OID 0)
-- Dependencies: 412
-- Name: cardapio_itens_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.cardapio_itens_seq_id_seq OWNED BY app.produtos_cardapio.seq_id;


--
-- TOC entry 345 (class 1259 OID 29833)
-- Name: cliente_pontos_movimentacao; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.cliente_pontos_movimentacao (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    id_cliente uuid NOT NULL,
    tipo character varying(10) NOT NULL,
    pontos integer NOT NULL,
    saldo_resultante integer NOT NULL,
    origem character varying(50) NOT NULL,
    id_loja uuid,
    id_item_recompensa uuid,
    observacao text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cliente_pontos_movimentacao_origem_check CHECK (((origem)::text = ANY ((ARRAY['MANUAL'::character varying, 'RESGATE'::character varying, 'AJUSTE'::character varying, 'PROMO'::character varying, 'OUTRO'::character varying])::text[]))),
    CONSTRAINT cliente_pontos_movimentacao_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['CREDITO'::character varying, 'DEBITO'::character varying, 'ESTORNO'::character varying])::text[])))
);


ALTER TABLE app.cliente_pontos_movimentacao OWNER TO postgres;

--
-- TOC entry 344 (class 1259 OID 29832)
-- Name: cliente_pontos_movimentacao_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.cliente_pontos_movimentacao_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.cliente_pontos_movimentacao_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4691 (class 0 OID 0)
-- Dependencies: 344
-- Name: cliente_pontos_movimentacao_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.cliente_pontos_movimentacao_seq_id_seq OWNED BY app.cliente_pontos_movimentacao.seq_id;


--
-- TOC entry 343 (class 1259 OID 29777)
-- Name: clientes; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.clientes (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    id_usuario uuid NOT NULL,
    id_loja uuid,
    nome_completo text NOT NULL,
    email text NOT NULL,
    whatsapp text NOT NULL,
    cep text NOT NULL,
    sexo character(1) NOT NULL,
    data_nascimento date,
    saldo integer DEFAULT 0 NOT NULL,
    aceite_termos boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT clientes_sexo_check CHECK ((sexo = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);


ALTER TABLE app.clientes OWNER TO postgres;

--
-- TOC entry 347 (class 1259 OID 29869)
-- Name: clientes_itens_recompensa; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.clientes_itens_recompensa (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    id_cliente uuid NOT NULL,
    id_item_recompensa uuid NOT NULL,
    id_movimentacao uuid,
    codigo_resgate character varying(10) NOT NULL,
    resgate_utilizado boolean DEFAULT false,
    dt_utilizado timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.clientes_itens_recompensa OWNER TO postgres;

--
-- TOC entry 346 (class 1259 OID 29868)
-- Name: clientes_itens_recompensa_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.clientes_itens_recompensa_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.clientes_itens_recompensa_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4692 (class 0 OID 0)
-- Dependencies: 346
-- Name: clientes_itens_recompensa_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.clientes_itens_recompensa_seq_id_seq OWNED BY app.clientes_itens_recompensa.seq_id;


--
-- TOC entry 342 (class 1259 OID 29776)
-- Name: clientes_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.clientes_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.clientes_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4693 (class 0 OID 0)
-- Dependencies: 342
-- Name: clientes_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.clientes_seq_id_seq OWNED BY app.clientes.seq_id;


--
-- TOC entry 419 (class 1259 OID 31010)
-- Name: comanda_itens; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.comanda_itens (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    comanda_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    quantidade numeric(10,3) DEFAULT 1 NOT NULL,
    preco_unitario numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    status character varying DEFAULT 'PENDENTE'::character varying NOT NULL,
    observacao text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    pedido_id uuid
);


ALTER TABLE app.comanda_itens OWNER TO postgres;

--
-- TOC entry 418 (class 1259 OID 31009)
-- Name: comanda_itens_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.comanda_itens_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.comanda_itens_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4694 (class 0 OID 0)
-- Dependencies: 418
-- Name: comanda_itens_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.comanda_itens_seq_id_seq OWNED BY app.comanda_itens.seq_id;


--
-- TOC entry 417 (class 1259 OID 30982)
-- Name: comandas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.comandas (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    mesa_id uuid NOT NULL,
    cliente_nome text,
    status character varying DEFAULT 'ABERTA'::character varying NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    aberta_em timestamp with time zone DEFAULT now() NOT NULL,
    fechada_em timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    whatsapp text
);


ALTER TABLE app.comandas OWNER TO postgres;

--
-- TOC entry 416 (class 1259 OID 30981)
-- Name: comandas_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.comandas_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.comandas_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4695 (class 0 OID 0)
-- Dependencies: 416
-- Name: comandas_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.comandas_seq_id_seq OWNED BY app.comandas.seq_id;


--
-- TOC entry 339 (class 1259 OID 29735)
-- Name: configuracoes_globais; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.configuracoes_globais (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    logo_base64 text,
    cor_fundo text,
    cor_card text,
    cor_texto_card text,
    cor_valor_card text,
    cor_botao text,
    cor_texto_botao text,
    fonte_titulos character varying(100),
    fonte_textos character varying(100),
    arquivo_politica_privacidade text,
    arquivo_termos_uso text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.configuracoes_globais OWNER TO postgres;

--
-- TOC entry 338 (class 1259 OID 29734)
-- Name: configuracoes_globais_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.configuracoes_globais_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.configuracoes_globais_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4696 (class 0 OID 0)
-- Dependencies: 338
-- Name: configuracoes_globais_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.configuracoes_globais_seq_id_seq OWNED BY app.configuracoes_globais.seq_id;


--
-- TOC entry 423 (class 1259 OID 31268)
-- Name: landing_pages; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.landing_pages (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    titulo text NOT NULL,
    slug text NOT NULL,
    content jsonb NOT NULL,
    ativa boolean DEFAULT true,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.landing_pages OWNER TO postgres;

--
-- TOC entry 422 (class 1259 OID 31267)
-- Name: landing_pages_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.landing_pages_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.landing_pages_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4697 (class 0 OID 0)
-- Dependencies: 422
-- Name: landing_pages_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.landing_pages_seq_id_seq OWNED BY app.landing_pages.seq_id;


--
-- TOC entry 353 (class 1259 OID 29959)
-- Name: log_sistema; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.log_sistema (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    nivel character varying(10) NOT NULL,
    operacao character varying(50) NOT NULL,
    tabela character varying(100),
    id_registro uuid,
    usuario_id uuid,
    mensagem text NOT NULL,
    dados_antes jsonb,
    dados_depois jsonb,
    ip_origem character varying(45),
    user_agent text,
    dados_extras jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT log_sistema_nivel_check CHECK (((nivel)::text = ANY ((ARRAY['INFO'::character varying, 'WARN'::character varying, 'ERROR'::character varying, 'DEBUG'::character varying])::text[])))
);


ALTER TABLE app.log_sistema OWNER TO postgres;

--
-- TOC entry 352 (class 1259 OID 29958)
-- Name: log_sistema_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.log_sistema_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.log_sistema_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4698 (class 0 OID 0)
-- Dependencies: 352
-- Name: log_sistema_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.log_sistema_seq_id_seq OWNED BY app.log_sistema.seq_id;


--
-- TOC entry 341 (class 1259 OID 29754)
-- Name: lojas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.lojas (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    nome_loja text NOT NULL,
    nome_loja_publico text,
    numero_identificador text NOT NULL,
    nome_responsavel text NOT NULL,
    telefone_responsavel text NOT NULL,
    cnpj text NOT NULL,
    endereco_completo text NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.lojas OWNER TO postgres;

--
-- TOC entry 340 (class 1259 OID 29753)
-- Name: lojas_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.lojas_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.lojas_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4699 (class 0 OID 0)
-- Dependencies: 340
-- Name: lojas_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.lojas_seq_id_seq OWNED BY app.lojas.seq_id;


--
-- TOC entry 433 (class 1259 OID 53017)
-- Name: matricula_turmas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.matricula_turmas (
    matricula_id uuid NOT NULL,
    turma_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE app.matricula_turmas OWNER TO postgres;

--
-- TOC entry 432 (class 1259 OID 52997)
-- Name: matriculas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.matriculas (
    uuid uuid NOT NULL,
    tenant_id uuid,
    aluno_id uuid,
    valor_mensalidade numeric(10,2),
    data_inicio date NOT NULL,
    data_fim date,
    status character varying(50) DEFAULT 'solicitado'::character varying,
    prontidao_respostas jsonb,
    termo_respostas jsonb,
    responsavel_respostas jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE app.matriculas OWNER TO postgres;

--
-- TOC entry 415 (class 1259 OID 30960)
-- Name: mesas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.mesas (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    numero text NOT NULL,
    capacidade integer DEFAULT 1,
    status character varying DEFAULT 'LIVRE'::character varying NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.mesas OWNER TO postgres;

--
-- TOC entry 414 (class 1259 OID 30959)
-- Name: mesas_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.mesas_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.mesas_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4700 (class 0 OID 0)
-- Dependencies: 414
-- Name: mesas_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.mesas_seq_id_seq OWNED BY app.mesas.seq_id;


--
-- TOC entry 420 (class 1259 OID 31087)
-- Name: notificacoes; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.notificacoes (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    tipo text NOT NULL,
    data_id uuid,
    lida boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    link text
);


ALTER TABLE app.notificacoes OWNER TO postgres;

--
-- TOC entry 421 (class 1259 OID 31177)
-- Name: notificacoes_lidas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.notificacoes_lidas (
    notificacao_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    lida_em timestamp with time zone DEFAULT now()
);


ALTER TABLE app.notificacoes_lidas OWNER TO postgres;

--
-- TOC entry 428 (class 1259 OID 31434)
-- Name: pedidos; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.pedidos (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    comanda_id uuid NOT NULL,
    status character varying DEFAULT 'NOVO'::character varying NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.pedidos OWNER TO postgres;

--
-- TOC entry 427 (class 1259 OID 31433)
-- Name: pedidos_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.pedidos_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.pedidos_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4701 (class 0 OID 0)
-- Dependencies: 427
-- Name: pedidos_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.pedidos_seq_id_seq OWNED BY app.pedidos.seq_id;


--
-- TOC entry 355 (class 1259 OID 29984)
-- Name: people; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    name character varying NOT NULL,
    cpf_cnpj character varying(20),
    birth_date date,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    usuario_id uuid,
    views text[] DEFAULT '{}'::text[]
);


ALTER TABLE app.people OWNER TO postgres;

--
-- TOC entry 357 (class 1259 OID 30004)
-- Name: people_addresses; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people_addresses (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    people_id uuid NOT NULL,
    address_type character varying,
    postal_code character varying,
    street character varying,
    number character varying,
    complement character varying,
    neighborhood character varying,
    city character varying,
    state character varying,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    latitude numeric(10,8),
    longitude numeric(11,8),
    plus_code character varying(255)
);


ALTER TABLE app.people_addresses OWNER TO postgres;

--
-- TOC entry 356 (class 1259 OID 30003)
-- Name: people_addresses_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_addresses_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_addresses_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4702 (class 0 OID 0)
-- Dependencies: 356
-- Name: people_addresses_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_addresses_seq_id_seq OWNED BY app.people_addresses.seq_id;


--
-- TOC entry 361 (class 1259 OID 30055)
-- Name: people_bank_accounts; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people_bank_accounts (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    people_id uuid NOT NULL,
    bank_code character varying,
    branch_code character varying,
    account_number character varying,
    account_type character varying,
    pix_key character varying,
    is_default_receipt boolean DEFAULT false,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.people_bank_accounts OWNER TO postgres;

--
-- TOC entry 360 (class 1259 OID 30054)
-- Name: people_bank_accounts_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_bank_accounts_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_bank_accounts_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4703 (class 0 OID 0)
-- Dependencies: 360
-- Name: people_bank_accounts_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_bank_accounts_seq_id_seq OWNED BY app.people_bank_accounts.seq_id;


--
-- TOC entry 359 (class 1259 OID 30029)
-- Name: people_contacts; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people_contacts (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    people_id uuid NOT NULL,
    contact_type character varying,
    contact_value character varying,
    label character varying,
    is_default boolean DEFAULT false,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.people_contacts OWNER TO postgres;

--
-- TOC entry 358 (class 1259 OID 30028)
-- Name: people_contacts_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_contacts_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_contacts_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4704 (class 0 OID 0)
-- Dependencies: 358
-- Name: people_contacts_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_contacts_seq_id_seq OWNED BY app.people_contacts.seq_id;


--
-- TOC entry 365 (class 1259 OID 30106)
-- Name: people_details; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people_details (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    people_id uuid NOT NULL,
    sex character varying,
    marital_status character varying,
    nationality character varying,
    occupation character varying,
    birth_date date,
    first_name character varying,
    surname character varying,
    legal_name character varying,
    trade_name character varying,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.people_details OWNER TO postgres;

--
-- TOC entry 364 (class 1259 OID 30105)
-- Name: people_details_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_details_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_details_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4705 (class 0 OID 0)
-- Dependencies: 364
-- Name: people_details_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_details_seq_id_seq OWNED BY app.people_details.seq_id;


--
-- TOC entry 363 (class 1259 OID 30081)
-- Name: people_documents; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people_documents (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    people_id uuid NOT NULL,
    category_code character varying,
    category_name character varying,
    file text,
    verification_status character varying,
    rejection_reason character varying,
    expiration_date date,
    file_name character varying,
    file_size character varying,
    document_internal_data jsonb,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.people_documents OWNER TO postgres;

--
-- TOC entry 362 (class 1259 OID 30080)
-- Name: people_documents_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_documents_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_documents_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4706 (class 0 OID 0)
-- Dependencies: 362
-- Name: people_documents_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_documents_seq_id_seq OWNED BY app.people_documents.seq_id;


--
-- TOC entry 367 (class 1259 OID 30131)
-- Name: people_relationship_types; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people_relationship_types (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    item_order integer DEFAULT 0,
    code character varying,
    connector_prefix character varying,
    relationship_source character varying,
    connector_suffix character varying,
    relationship_target character varying,
    inverse_type_id uuid,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.people_relationship_types OWNER TO postgres;

--
-- TOC entry 366 (class 1259 OID 30130)
-- Name: people_relationship_types_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_relationship_types_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_relationship_types_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4707 (class 0 OID 0)
-- Dependencies: 366
-- Name: people_relationship_types_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_relationship_types_seq_id_seq OWNED BY app.people_relationship_types.seq_id;


--
-- TOC entry 369 (class 1259 OID 30152)
-- Name: people_relationships; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.people_relationships (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    people_relationship_types_id uuid NOT NULL,
    people_id_source uuid NOT NULL,
    people_id_target uuid NOT NULL,
    tenant_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.people_relationships OWNER TO postgres;

--
-- TOC entry 368 (class 1259 OID 30151)
-- Name: people_relationships_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_relationships_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_relationships_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4708 (class 0 OID 0)
-- Dependencies: 368
-- Name: people_relationships_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_relationships_seq_id_seq OWNED BY app.people_relationships.seq_id;


--
-- TOC entry 354 (class 1259 OID 29983)
-- Name: people_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.people_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.people_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4709 (class 0 OID 0)
-- Dependencies: 354
-- Name: people_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.people_seq_id_seq OWNED BY app.people.seq_id;


--
-- TOC entry 371 (class 1259 OID 30186)
-- Name: pluvyt_clients; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.pluvyt_clients (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    person_id uuid NOT NULL,
    saldo integer DEFAULT 0 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.pluvyt_clients OWNER TO postgres;

--
-- TOC entry 370 (class 1259 OID 30185)
-- Name: pluvyt_clients_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.pluvyt_clients_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.pluvyt_clients_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4710 (class 0 OID 0)
-- Dependencies: 370
-- Name: pluvyt_clients_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.pluvyt_clients_seq_id_seq OWNED BY app.pluvyt_clients.seq_id;


--
-- TOC entry 411 (class 1259 OID 30731)
-- Name: point_transactions; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.point_transactions (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    client_id uuid NOT NULL,
    type character varying(20) NOT NULL,
    points integer NOT NULL,
    resulting_balance integer NOT NULL,
    origin character varying(50) NOT NULL,
    reward_item_id uuid,
    observation text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    loja_id uuid,
    CONSTRAINT point_transactions_origin_check CHECK (((origin)::text = ANY ((ARRAY['MANUAL'::character varying, 'RESGATE'::character varying, 'AJUSTE'::character varying, 'PROMO'::character varying, 'OUTRO'::character varying])::text[]))),
    CONSTRAINT point_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['CREDITO'::character varying, 'DEBITO'::character varying, 'ESTORNO'::character varying])::text[])))
);


ALTER TABLE app.point_transactions OWNER TO postgres;

--
-- TOC entry 410 (class 1259 OID 30730)
-- Name: point_transactions_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.point_transactions_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.point_transactions_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4711 (class 0 OID 0)
-- Dependencies: 410
-- Name: point_transactions_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.point_transactions_seq_id_seq OWNED BY app.point_transactions.seq_id;


--
-- TOC entry 426 (class 1259 OID 31386)
-- Name: product_lists; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.product_lists (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying NOT NULL,
    product_uuids uuid[] DEFAULT '{}'::uuid[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by uuid,
    deleted_at timestamp with time zone
);


ALTER TABLE app.product_lists OWNER TO postgres;

--
-- TOC entry 391 (class 1259 OID 30413)
-- Name: produtos; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    nome character varying NOT NULL,
    codigo character varying,
    unidade character varying NOT NULL,
    marca character varying,
    tipo_code character varying,
    situacao_code character varying,
    classe_produto_code character varying,
    categoria_code character varying,
    garantia character varying,
    descricao_complementar text,
    obs text,
    dias_preparacao integer DEFAULT 0,
    tags text[],
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    views text[] DEFAULT '{}'::text[],
    descricao text
);


ALTER TABLE app.produtos OWNER TO postgres;

--
-- TOC entry 4712 (class 0 OID 0)
-- Dependencies: 391
-- Name: TABLE produtos; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos IS 'Tabela principal de produtos (conforme Tiny ERP)';


--
-- TOC entry 387 (class 1259 OID 30367)
-- Name: produtos_categoria_category_enum; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_categoria_category_enum (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    code character varying NOT NULL,
    tenant_id uuid,
    name character varying NOT NULL,
    description character varying,
    icon character varying DEFAULT 'Notification'::character varying NOT NULL,
    sort integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    parent_uuid uuid
);


ALTER TABLE app.produtos_categoria_category_enum OWNER TO postgres;

--
-- TOC entry 386 (class 1259 OID 30366)
-- Name: produtos_categoria_category_enum_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_categoria_category_enum_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_categoria_category_enum_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4713 (class 0 OID 0)
-- Dependencies: 386
-- Name: produtos_categoria_category_enum_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_categoria_category_enum_seq_id_seq OWNED BY app.produtos_categoria_category_enum.seq_id;


--
-- TOC entry 381 (class 1259 OID 30298)
-- Name: produtos_classe_produto_category_enum; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_classe_produto_category_enum (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    code character varying NOT NULL,
    tenant_id uuid,
    name character varying NOT NULL,
    description character varying,
    icon character varying DEFAULT 'Notification'::character varying NOT NULL,
    sort integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_classe_produto_category_enum OWNER TO postgres;

--
-- TOC entry 380 (class 1259 OID 30297)
-- Name: produtos_classe_produto_category_enum_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_classe_produto_category_enum_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_classe_produto_category_enum_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4714 (class 0 OID 0)
-- Dependencies: 380
-- Name: produtos_classe_produto_category_enum_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_classe_produto_category_enum_seq_id_seq OWNED BY app.produtos_classe_produto_category_enum.seq_id;


--
-- TOC entry 395 (class 1259 OID 30484)
-- Name: produtos_ficha_tecnica; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_ficha_tecnica (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    chave character varying NOT NULL,
    valor character varying NOT NULL,
    sort integer DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_ficha_tecnica OWNER TO postgres;

--
-- TOC entry 4715 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE produtos_ficha_tecnica; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_ficha_tecnica IS 'Atributos técnicos dinâmicos do produto (Ficha Técnica)';


--
-- TOC entry 394 (class 1259 OID 30483)
-- Name: produtos_ficha_tecnica_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_ficha_tecnica_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_ficha_tecnica_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4716 (class 0 OID 0)
-- Dependencies: 394
-- Name: produtos_ficha_tecnica_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_ficha_tecnica_seq_id_seq OWNED BY app.produtos_ficha_tecnica.seq_id;


--
-- TOC entry 393 (class 1259 OID 30453)
-- Name: produtos_fiscal; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_fiscal (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    ncm character varying,
    gtin character varying,
    gtin_embalagem character varying,
    cest character varying,
    origem_code character varying,
    codigo_anvisa character varying,
    motivo_isencao text,
    classe_ipi character varying,
    valor_ipi_fixo numeric(15,2),
    cod_lista_servicos character varying,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_fiscal OWNER TO postgres;

--
-- TOC entry 4717 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE produtos_fiscal; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_fiscal IS 'Dados fiscais do produto';


--
-- TOC entry 392 (class 1259 OID 30452)
-- Name: produtos_fiscal_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_fiscal_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_fiscal_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4718 (class 0 OID 0)
-- Dependencies: 392
-- Name: produtos_fiscal_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_fiscal_seq_id_seq OWNED BY app.produtos_fiscal.seq_id;


--
-- TOC entry 405 (class 1259 OID 30624)
-- Name: produtos_kit; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_kit (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_pai_id uuid NOT NULL,
    produto_filho_id uuid NOT NULL,
    quantidade numeric(15,4) DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_kit OWNER TO postgres;

--
-- TOC entry 4719 (class 0 OID 0)
-- Dependencies: 405
-- Name: TABLE produtos_kit; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_kit IS 'Estrutura de composição para produtos do tipo Kit';


--
-- TOC entry 404 (class 1259 OID 30623)
-- Name: produtos_kit_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_kit_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_kit_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4720 (class 0 OID 0)
-- Dependencies: 404
-- Name: produtos_kit_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_kit_seq_id_seq OWNED BY app.produtos_kit.seq_id;


--
-- TOC entry 397 (class 1259 OID 30509)
-- Name: produtos_logistica; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_logistica (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    peso_liquido numeric(15,4),
    peso_bruto numeric(15,4),
    estoque_minimo numeric(15,4) DEFAULT 0,
    estoque_maximo numeric(15,4) DEFAULT 0,
    estoque_atual numeric(15,4) DEFAULT 0,
    localizacao character varying,
    unidade_por_caixa character varying,
    tipo_embalagem_code character varying,
    altura_embalagem numeric(15,2),
    largura_embalagem numeric(15,2),
    comprimento_embalagem numeric(15,2),
    diametro_embalagem numeric(15,2),
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_logistica OWNER TO postgres;

--
-- TOC entry 4721 (class 0 OID 0)
-- Dependencies: 397
-- Name: TABLE produtos_logistica; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_logistica IS 'Dados de logística e estoque do produto';


--
-- TOC entry 396 (class 1259 OID 30508)
-- Name: produtos_logistica_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_logistica_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_logistica_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4722 (class 0 OID 0)
-- Dependencies: 396
-- Name: produtos_logistica_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_logistica_seq_id_seq OWNED BY app.produtos_logistica.seq_id;


--
-- TOC entry 403 (class 1259 OID 30594)
-- Name: produtos_media; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_media (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    url text,
    arquivo text,
    tipo_code character varying,
    ordem integer DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    file_name character varying,
    file_size numeric(15,2)
);


ALTER TABLE app.produtos_media OWNER TO postgres;

--
-- TOC entry 4723 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE produtos_media; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_media IS 'Mídias e anexos relacionados ao produto';


--
-- TOC entry 402 (class 1259 OID 30593)
-- Name: produtos_media_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_media_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_media_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4724 (class 0 OID 0)
-- Dependencies: 402
-- Name: produtos_media_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_media_seq_id_seq OWNED BY app.produtos_media.seq_id;


--
-- TOC entry 389 (class 1259 OID 30390)
-- Name: produtos_media_tipo_category_enum; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_media_tipo_category_enum (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    code character varying NOT NULL,
    tenant_id uuid,
    name character varying NOT NULL,
    description character varying,
    icon character varying DEFAULT 'Notification'::character varying NOT NULL,
    sort integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_media_tipo_category_enum OWNER TO postgres;

--
-- TOC entry 388 (class 1259 OID 30389)
-- Name: produtos_media_tipo_category_enum_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_media_tipo_category_enum_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_media_tipo_category_enum_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4725 (class 0 OID 0)
-- Dependencies: 388
-- Name: produtos_media_tipo_category_enum_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_media_tipo_category_enum_seq_id_seq OWNED BY app.produtos_media_tipo_category_enum.seq_id;


--
-- TOC entry 383 (class 1259 OID 30321)
-- Name: produtos_origem_category_enum; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_origem_category_enum (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    code character varying NOT NULL,
    tenant_id uuid,
    name character varying NOT NULL,
    description character varying,
    icon character varying DEFAULT 'Notification'::character varying NOT NULL,
    sort integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_origem_category_enum OWNER TO postgres;

--
-- TOC entry 382 (class 1259 OID 30320)
-- Name: produtos_origem_category_enum_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_origem_category_enum_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_origem_category_enum_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4726 (class 0 OID 0)
-- Dependencies: 382
-- Name: produtos_origem_category_enum_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_origem_category_enum_seq_id_seq OWNED BY app.produtos_origem_category_enum.seq_id;


--
-- TOC entry 399 (class 1259 OID 30543)
-- Name: produtos_precos; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_precos (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    preco numeric(15,2) DEFAULT 0 NOT NULL,
    preco_promocional numeric(15,2),
    preco_custo numeric(15,2),
    valor_max numeric(15,2),
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_precos OWNER TO postgres;

--
-- TOC entry 4727 (class 0 OID 0)
-- Dependencies: 399
-- Name: TABLE produtos_precos; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_precos IS 'Informações de precificação do produto';


--
-- TOC entry 398 (class 1259 OID 30542)
-- Name: produtos_precos_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_precos_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_precos_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4728 (class 0 OID 0)
-- Dependencies: 398
-- Name: produtos_precos_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_precos_seq_id_seq OWNED BY app.produtos_precos.seq_id;


--
-- TOC entry 409 (class 1259 OID 30697)
-- Name: produtos_recompensas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_recompensas (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    qtd_pontos_resgate integer DEFAULT 0 NOT NULL,
    voucher_digital boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.produtos_recompensas OWNER TO postgres;

--
-- TOC entry 4729 (class 0 OID 0)
-- Dependencies: 409
-- Name: TABLE produtos_recompensas; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_recompensas IS 'Tabela de itens de recompensa do programa Pluvyt (vinculado a produtos)';


--
-- TOC entry 401 (class 1259 OID 30568)
-- Name: produtos_seo; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_seo (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_id uuid NOT NULL,
    seo_title character varying,
    seo_keywords text,
    seo_description text,
    link_video text,
    slug text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_seo OWNER TO postgres;

--
-- TOC entry 4730 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE produtos_seo; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_seo IS 'Metadados para SEO e marketing digital';


--
-- TOC entry 400 (class 1259 OID 30567)
-- Name: produtos_seo_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_seo_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_seo_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4731 (class 0 OID 0)
-- Dependencies: 400
-- Name: produtos_seo_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_seo_seq_id_seq OWNED BY app.produtos_seo.seq_id;


--
-- TOC entry 390 (class 1259 OID 30412)
-- Name: produtos_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4732 (class 0 OID 0)
-- Dependencies: 390
-- Name: produtos_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_seq_id_seq OWNED BY app.produtos.seq_id;


--
-- TOC entry 379 (class 1259 OID 30275)
-- Name: produtos_situacao_category_enum; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_situacao_category_enum (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    code character varying NOT NULL,
    tenant_id uuid,
    name character varying NOT NULL,
    description character varying,
    icon character varying DEFAULT 'Notification'::character varying NOT NULL,
    sort integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_situacao_category_enum OWNER TO postgres;

--
-- TOC entry 378 (class 1259 OID 30274)
-- Name: produtos_situacao_category_enum_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_situacao_category_enum_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_situacao_category_enum_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4733 (class 0 OID 0)
-- Dependencies: 378
-- Name: produtos_situacao_category_enum_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_situacao_category_enum_seq_id_seq OWNED BY app.produtos_situacao_category_enum.seq_id;


--
-- TOC entry 377 (class 1259 OID 30252)
-- Name: produtos_tipo_category_enum; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_tipo_category_enum (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    code character varying NOT NULL,
    tenant_id uuid,
    name character varying NOT NULL,
    description character varying,
    icon character varying DEFAULT 'Notification'::character varying NOT NULL,
    sort integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_tipo_category_enum OWNER TO postgres;

--
-- TOC entry 376 (class 1259 OID 30251)
-- Name: produtos_tipo_category_enum_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_tipo_category_enum_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_tipo_category_enum_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4734 (class 0 OID 0)
-- Dependencies: 376
-- Name: produtos_tipo_category_enum_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_tipo_category_enum_seq_id_seq OWNED BY app.produtos_tipo_category_enum.seq_id;


--
-- TOC entry 385 (class 1259 OID 30344)
-- Name: produtos_tipo_embalagem_category_enum; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_tipo_embalagem_category_enum (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    code character varying NOT NULL,
    tenant_id uuid,
    name character varying NOT NULL,
    description character varying,
    icon character varying DEFAULT 'Notification'::character varying NOT NULL,
    sort integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_tipo_embalagem_category_enum OWNER TO postgres;

--
-- TOC entry 384 (class 1259 OID 30343)
-- Name: produtos_tipo_embalagem_category_enum_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_tipo_embalagem_category_enum_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_tipo_embalagem_category_enum_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4735 (class 0 OID 0)
-- Dependencies: 384
-- Name: produtos_tipo_embalagem_category_enum_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_tipo_embalagem_category_enum_seq_id_seq OWNED BY app.produtos_tipo_embalagem_category_enum.seq_id;


--
-- TOC entry 407 (class 1259 OID 30652)
-- Name: produtos_variacoes; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.produtos_variacoes (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    produto_pai_id uuid NOT NULL,
    produto_filho_id uuid NOT NULL,
    grade jsonb,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.produtos_variacoes OWNER TO postgres;

--
-- TOC entry 4736 (class 0 OID 0)
-- Dependencies: 407
-- Name: TABLE produtos_variacoes; Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON TABLE app.produtos_variacoes IS 'Vincule produtos filhos (variações) ao produto pai';


--
-- TOC entry 406 (class 1259 OID 30651)
-- Name: produtos_variacoes_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.produtos_variacoes_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.produtos_variacoes_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4737 (class 0 OID 0)
-- Dependencies: 406
-- Name: produtos_variacoes_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.produtos_variacoes_seq_id_seq OWNED BY app.produtos_variacoes.seq_id;


--
-- TOC entry 408 (class 1259 OID 30696)
-- Name: recompensas_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.recompensas_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.recompensas_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4738 (class 0 OID 0)
-- Dependencies: 408
-- Name: recompensas_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.recompensas_seq_id_seq OWNED BY app.produtos_recompensas.seq_id;


--
-- TOC entry 349 (class 1259 OID 29904)
-- Name: remetentes_smtp; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.remetentes_smtp (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    smtp_host text NOT NULL,
    smtp_port integer NOT NULL,
    smtp_secure boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.remetentes_smtp OWNER TO postgres;

--
-- TOC entry 348 (class 1259 OID 29903)
-- Name: remetentes_smtp_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.remetentes_smtp_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.remetentes_smtp_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4739 (class 0 OID 0)
-- Dependencies: 348
-- Name: remetentes_smtp_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.remetentes_smtp_seq_id_seq OWNED BY app.remetentes_smtp.seq_id;


--
-- TOC entry 429 (class 1259 OID 52307)
-- Name: restaurante_metas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.restaurante_metas (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    recebido_min interval DEFAULT '00:05:00'::interval NOT NULL,
    pronto_min interval DEFAULT '00:10:00'::interval NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE app.restaurante_metas OWNER TO postgres;

--
-- TOC entry 373 (class 1259 OID 30211)
-- Name: tenant_addresses; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.tenant_addresses (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    postal_code character varying(20),
    street character varying(255),
    number character varying(20),
    complement character varying(255),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(50),
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    latitude double precision,
    longitude double precision,
    plus_code character varying(50)
);


ALTER TABLE app.tenant_addresses OWNER TO postgres;

--
-- TOC entry 372 (class 1259 OID 30210)
-- Name: tenant_addresses_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.tenant_addresses_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.tenant_addresses_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4740 (class 0 OID 0)
-- Dependencies: 372
-- Name: tenant_addresses_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.tenant_addresses_seq_id_seq OWNED BY app.tenant_addresses.seq_id;


--
-- TOC entry 375 (class 1259 OID 30232)
-- Name: tenant_contacts; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.tenant_contacts (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    contact_type character varying(50) NOT NULL,
    contact_value character varying(255) NOT NULL,
    label character varying(100),
    is_default boolean DEFAULT false,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.tenant_contacts OWNER TO postgres;

--
-- TOC entry 374 (class 1259 OID 30231)
-- Name: tenant_contacts_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.tenant_contacts_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.tenant_contacts_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4741 (class 0 OID 0)
-- Dependencies: 374
-- Name: tenant_contacts_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.tenant_contacts_seq_id_seq OWNED BY app.tenant_contacts.seq_id;


--
-- TOC entry 331 (class 1259 OID 29642)
-- Name: tenants; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.tenants (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pessoa_id uuid,
    modules text[] DEFAULT '{}'::text[],
    logo text,
    category character varying DEFAULT 'Sem Categoria'::character varying,
    description text,
    brand_settings jsonb,
    social_media jsonb DEFAULT '{}'::jsonb,
    pluvyt_points_per_spent numeric DEFAULT 10
);


ALTER TABLE app.tenants OWNER TO postgres;

--
-- TOC entry 330 (class 1259 OID 29641)
-- Name: tenants_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.tenants_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.tenants_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4742 (class 0 OID 0)
-- Dependencies: 330
-- Name: tenants_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.tenants_seq_id_seq OWNED BY app.tenants.seq_id;


--
-- TOC entry 431 (class 1259 OID 52981)
-- Name: turma_inscritos; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.turma_inscritos (
    turma_id uuid NOT NULL,
    pessoa_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE app.turma_inscritos OWNER TO postgres;

--
-- TOC entry 430 (class 1259 OID 52961)
-- Name: turmas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.turmas (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    tipo character varying(100),
    responsavel_id uuid,
    nivel_dificuldade character varying(50),
    dias_semana integer[],
    horario_inicio time without time zone,
    horario_termino time without time zone,
    local character varying(255),
    capacidade_maxima integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE app.turmas OWNER TO postgres;

--
-- TOC entry 333 (class 1259 OID 29658)
-- Name: users; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.users (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    seq_id integer NOT NULL,
    tenant_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    login character varying(80) NOT NULL,
    email character varying(160) NOT NULL,
    password character varying(255),
    allow_features text[] DEFAULT '{}'::text[] NOT NULL,
    denied_features text[] DEFAULT '{}'::text[] NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email_verified_at timestamp with time zone,
    email_verification_token text,
    email_verification_expires_at timestamp with time zone,
    password_reset_token text,
    password_reset_expires_at timestamp with time zone
);


ALTER TABLE app.users OWNER TO postgres;

--
-- TOC entry 332 (class 1259 OID 29657)
-- Name: users_seq_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.users_seq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.users_seq_id_seq OWNER TO postgres;

--
-- TOC entry 4743 (class 0 OID 0)
-- Dependencies: 332
-- Name: users_seq_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.users_seq_id_seq OWNED BY app.users.seq_id;


--
-- TOC entry 3868 (class 2604 OID 29710)
-- Name: access_group_memberships seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_group_memberships ALTER COLUMN seq_id SET DEFAULT nextval('app.access_group_memberships_seq_id_seq'::regclass);


--
-- TOC entry 3861 (class 2604 OID 29687)
-- Name: access_groups seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_groups ALTER COLUMN seq_id SET DEFAULT nextval('app.access_groups_seq_id_seq'::regclass);


--
-- TOC entry 3900 (class 2604 OID 29928)
-- Name: campanhas_disparo seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.campanhas_disparo ALTER COLUMN seq_id SET DEFAULT nextval('app.campanhas_disparo_seq_id_seq'::regclass);


--
-- TOC entry 3886 (class 2604 OID 29837)
-- Name: cliente_pontos_movimentacao seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cliente_pontos_movimentacao ALTER COLUMN seq_id SET DEFAULT nextval('app.cliente_pontos_movimentacao_seq_id_seq'::regclass);


--
-- TOC entry 3880 (class 2604 OID 29781)
-- Name: clientes seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes ALTER COLUMN seq_id SET DEFAULT nextval('app.clientes_seq_id_seq'::regclass);


--
-- TOC entry 3890 (class 2604 OID 29873)
-- Name: clientes_itens_recompensa seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes_itens_recompensa ALTER COLUMN seq_id SET DEFAULT nextval('app.clientes_itens_recompensa_seq_id_seq'::regclass);


--
-- TOC entry 4083 (class 2604 OID 31014)
-- Name: comanda_itens seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comanda_itens ALTER COLUMN seq_id SET DEFAULT nextval('app.comanda_itens_seq_id_seq'::regclass);


--
-- TOC entry 4076 (class 2604 OID 30986)
-- Name: comandas seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comandas ALTER COLUMN seq_id SET DEFAULT nextval('app.comandas_seq_id_seq'::regclass);


--
-- TOC entry 3872 (class 2604 OID 29739)
-- Name: configuracoes_globais seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.configuracoes_globais ALTER COLUMN seq_id SET DEFAULT nextval('app.configuracoes_globais_seq_id_seq'::regclass);


--
-- TOC entry 4093 (class 2604 OID 31272)
-- Name: landing_pages seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.landing_pages ALTER COLUMN seq_id SET DEFAULT nextval('app.landing_pages_seq_id_seq'::regclass);


--
-- TOC entry 3913 (class 2604 OID 29963)
-- Name: log_sistema seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.log_sistema ALTER COLUMN seq_id SET DEFAULT nextval('app.log_sistema_seq_id_seq'::regclass);


--
-- TOC entry 3876 (class 2604 OID 29758)
-- Name: lojas seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.lojas ALTER COLUMN seq_id SET DEFAULT nextval('app.lojas_seq_id_seq'::regclass);


--
-- TOC entry 4070 (class 2604 OID 30964)
-- Name: mesas seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.mesas ALTER COLUMN seq_id SET DEFAULT nextval('app.mesas_seq_id_seq'::regclass);


--
-- TOC entry 4102 (class 2604 OID 31438)
-- Name: pedidos seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pedidos ALTER COLUMN seq_id SET DEFAULT nextval('app.pedidos_seq_id_seq'::regclass);


--
-- TOC entry 3916 (class 2604 OID 29988)
-- Name: people seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people ALTER COLUMN seq_id SET DEFAULT nextval('app.people_seq_id_seq'::regclass);


--
-- TOC entry 3921 (class 2604 OID 30008)
-- Name: people_addresses seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_addresses ALTER COLUMN seq_id SET DEFAULT nextval('app.people_addresses_seq_id_seq'::regclass);


--
-- TOC entry 3930 (class 2604 OID 30059)
-- Name: people_bank_accounts seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_bank_accounts ALTER COLUMN seq_id SET DEFAULT nextval('app.people_bank_accounts_seq_id_seq'::regclass);


--
-- TOC entry 3925 (class 2604 OID 30033)
-- Name: people_contacts seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_contacts ALTER COLUMN seq_id SET DEFAULT nextval('app.people_contacts_seq_id_seq'::regclass);


--
-- TOC entry 3939 (class 2604 OID 30110)
-- Name: people_details seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_details ALTER COLUMN seq_id SET DEFAULT nextval('app.people_details_seq_id_seq'::regclass);


--
-- TOC entry 3935 (class 2604 OID 30085)
-- Name: people_documents seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_documents ALTER COLUMN seq_id SET DEFAULT nextval('app.people_documents_seq_id_seq'::regclass);


--
-- TOC entry 3943 (class 2604 OID 30135)
-- Name: people_relationship_types seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationship_types ALTER COLUMN seq_id SET DEFAULT nextval('app.people_relationship_types_seq_id_seq'::regclass);


--
-- TOC entry 3948 (class 2604 OID 30156)
-- Name: people_relationships seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationships ALTER COLUMN seq_id SET DEFAULT nextval('app.people_relationships_seq_id_seq'::regclass);


--
-- TOC entry 3952 (class 2604 OID 30190)
-- Name: pluvyt_clients seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pluvyt_clients ALTER COLUMN seq_id SET DEFAULT nextval('app.pluvyt_clients_seq_id_seq'::regclass);


--
-- TOC entry 4059 (class 2604 OID 30735)
-- Name: point_transactions seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.point_transactions ALTER COLUMN seq_id SET DEFAULT nextval('app.point_transactions_seq_id_seq'::regclass);


--
-- TOC entry 4008 (class 2604 OID 30417)
-- Name: produtos seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_seq_id_seq'::regclass);


--
-- TOC entry 4063 (class 2604 OID 30808)
-- Name: produtos_cardapio seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_cardapio ALTER COLUMN seq_id SET DEFAULT nextval('app.cardapio_itens_seq_id_seq'::regclass);


--
-- TOC entry 3996 (class 2604 OID 30371)
-- Name: produtos_categoria_category_enum seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_categoria_category_enum ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_categoria_category_enum_seq_id_seq'::regclass);


--
-- TOC entry 3978 (class 2604 OID 30302)
-- Name: produtos_classe_produto_category_enum seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_classe_produto_category_enum ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_classe_produto_category_enum_seq_id_seq'::regclass);


--
-- TOC entry 4018 (class 2604 OID 30488)
-- Name: produtos_ficha_tecnica seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_ficha_tecnica ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_ficha_tecnica_seq_id_seq'::regclass);


--
-- TOC entry 4014 (class 2604 OID 30457)
-- Name: produtos_fiscal seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_fiscal ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_fiscal_seq_id_seq'::regclass);


--
-- TOC entry 4044 (class 2604 OID 30628)
-- Name: produtos_kit seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_kit ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_kit_seq_id_seq'::regclass);


--
-- TOC entry 4023 (class 2604 OID 30513)
-- Name: produtos_logistica seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_logistica ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_logistica_seq_id_seq'::regclass);


--
-- TOC entry 4039 (class 2604 OID 30598)
-- Name: produtos_media seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_media_seq_id_seq'::regclass);


--
-- TOC entry 4002 (class 2604 OID 30394)
-- Name: produtos_media_tipo_category_enum seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media_tipo_category_enum ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_media_tipo_category_enum_seq_id_seq'::regclass);


--
-- TOC entry 3984 (class 2604 OID 30325)
-- Name: produtos_origem_category_enum seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_origem_category_enum ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_origem_category_enum_seq_id_seq'::regclass);


--
-- TOC entry 4030 (class 2604 OID 30547)
-- Name: produtos_precos seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_precos ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_precos_seq_id_seq'::regclass);


--
-- TOC entry 4053 (class 2604 OID 30701)
-- Name: produtos_recompensas seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_recompensas ALTER COLUMN seq_id SET DEFAULT nextval('app.recompensas_seq_id_seq'::regclass);


--
-- TOC entry 4035 (class 2604 OID 30572)
-- Name: produtos_seo seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_seo ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_seo_seq_id_seq'::regclass);


--
-- TOC entry 3972 (class 2604 OID 30279)
-- Name: produtos_situacao_category_enum seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_situacao_category_enum ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_situacao_category_enum_seq_id_seq'::regclass);


--
-- TOC entry 3966 (class 2604 OID 30256)
-- Name: produtos_tipo_category_enum seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_category_enum ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_tipo_category_enum_seq_id_seq'::regclass);


--
-- TOC entry 3990 (class 2604 OID 30348)
-- Name: produtos_tipo_embalagem_category_enum seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_embalagem_category_enum ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_tipo_embalagem_category_enum_seq_id_seq'::regclass);


--
-- TOC entry 4049 (class 2604 OID 30656)
-- Name: produtos_variacoes seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_variacoes ALTER COLUMN seq_id SET DEFAULT nextval('app.produtos_variacoes_seq_id_seq'::regclass);


--
-- TOC entry 3895 (class 2604 OID 29908)
-- Name: remetentes_smtp seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.remetentes_smtp ALTER COLUMN seq_id SET DEFAULT nextval('app.remetentes_smtp_seq_id_seq'::regclass);


--
-- TOC entry 3957 (class 2604 OID 30215)
-- Name: tenant_addresses seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_addresses ALTER COLUMN seq_id SET DEFAULT nextval('app.tenant_addresses_seq_id_seq'::regclass);


--
-- TOC entry 3961 (class 2604 OID 30236)
-- Name: tenant_contacts seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_contacts ALTER COLUMN seq_id SET DEFAULT nextval('app.tenant_contacts_seq_id_seq'::regclass);


--
-- TOC entry 3847 (class 2604 OID 29646)
-- Name: tenants seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenants ALTER COLUMN seq_id SET DEFAULT nextval('app.tenants_seq_id_seq'::regclass);


--
-- TOC entry 3855 (class 2604 OID 29662)
-- Name: users seq_id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.users ALTER COLUMN seq_id SET DEFAULT nextval('app.users_seq_id_seq'::regclass);


--
-- TOC entry 4428 (class 2606 OID 53042)
-- Name: academia_questionario_templates academia_questionario_templates_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.academia_questionario_templates
    ADD CONSTRAINT academia_questionario_templates_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4430 (class 2606 OID 53044)
-- Name: academia_questionario_templates academia_questionario_templates_tenant_id_tipo_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.academia_questionario_templates
    ADD CONSTRAINT academia_questionario_templates_tenant_id_tipo_key UNIQUE (tenant_id, tipo);


--
-- TOC entry 4153 (class 2606 OID 29714)
-- Name: access_group_memberships access_group_memberships_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_group_memberships
    ADD CONSTRAINT access_group_memberships_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4155 (class 2606 OID 29716)
-- Name: access_group_memberships access_group_memberships_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_group_memberships
    ADD CONSTRAINT access_group_memberships_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4157 (class 2606 OID 29718)
-- Name: access_group_memberships access_group_memberships_user_id_group_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_group_memberships
    ADD CONSTRAINT access_group_memberships_user_id_group_id_key UNIQUE (user_id, group_id);


--
-- TOC entry 4146 (class 2606 OID 29695)
-- Name: access_groups access_groups_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_groups
    ADD CONSTRAINT access_groups_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4148 (class 2606 OID 29697)
-- Name: access_groups access_groups_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_groups
    ADD CONSTRAINT access_groups_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4150 (class 2606 OID 29699)
-- Name: access_groups access_groups_tenant_id_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_groups
    ADD CONSTRAINT access_groups_tenant_id_code_key UNIQUE (tenant_id, code);


--
-- TOC entry 4195 (class 2606 OID 29943)
-- Name: campanhas_disparo campanhas_disparo_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.campanhas_disparo
    ADD CONSTRAINT campanhas_disparo_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4197 (class 2606 OID 29945)
-- Name: campanhas_disparo campanhas_disparo_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.campanhas_disparo
    ADD CONSTRAINT campanhas_disparo_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4199 (class 2606 OID 29947)
-- Name: campanhas_disparo campanhas_disparo_tenant_id_chave_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.campanhas_disparo
    ADD CONSTRAINT campanhas_disparo_tenant_id_chave_key UNIQUE (tenant_id, chave);


--
-- TOC entry 4379 (class 2606 OID 30814)
-- Name: produtos_cardapio cardapio_itens_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_cardapio
    ADD CONSTRAINT cardapio_itens_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4381 (class 2606 OID 30958)
-- Name: produtos_cardapio cardapio_itens_tenant_produto_unique; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_cardapio
    ADD CONSTRAINT cardapio_itens_tenant_produto_unique UNIQUE (tenant_id, produto_id);


--
-- TOC entry 4181 (class 2606 OID 29845)
-- Name: cliente_pontos_movimentacao cliente_pontos_movimentacao_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cliente_pontos_movimentacao
    ADD CONSTRAINT cliente_pontos_movimentacao_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4183 (class 2606 OID 29847)
-- Name: cliente_pontos_movimentacao cliente_pontos_movimentacao_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cliente_pontos_movimentacao
    ADD CONSTRAINT cliente_pontos_movimentacao_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4185 (class 2606 OID 29878)
-- Name: clientes_itens_recompensa clientes_itens_recompensa_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes_itens_recompensa
    ADD CONSTRAINT clientes_itens_recompensa_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4187 (class 2606 OID 29880)
-- Name: clientes_itens_recompensa clientes_itens_recompensa_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes_itens_recompensa
    ADD CONSTRAINT clientes_itens_recompensa_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4189 (class 2606 OID 29882)
-- Name: clientes_itens_recompensa clientes_itens_recompensa_tenant_id_codigo_resgate_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes_itens_recompensa
    ADD CONSTRAINT clientes_itens_recompensa_tenant_id_codigo_resgate_key UNIQUE (tenant_id, codigo_resgate);


--
-- TOC entry 4172 (class 2606 OID 29790)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4174 (class 2606 OID 29792)
-- Name: clientes clientes_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes
    ADD CONSTRAINT clientes_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4176 (class 2606 OID 29794)
-- Name: clientes clientes_tenant_id_email_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes
    ADD CONSTRAINT clientes_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- TOC entry 4178 (class 2606 OID 29796)
-- Name: clientes clientes_tenant_id_id_usuario_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes
    ADD CONSTRAINT clientes_tenant_id_id_usuario_key UNIQUE (tenant_id, id_usuario);


--
-- TOC entry 4394 (class 2606 OID 31022)
-- Name: comanda_itens comanda_itens_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comanda_itens
    ADD CONSTRAINT comanda_itens_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4389 (class 2606 OID 30995)
-- Name: comandas comandas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comandas
    ADD CONSTRAINT comandas_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4159 (class 2606 OID 29745)
-- Name: configuracoes_globais configuracoes_globais_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.configuracoes_globais
    ADD CONSTRAINT configuracoes_globais_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4161 (class 2606 OID 29747)
-- Name: configuracoes_globais configuracoes_globais_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.configuracoes_globais
    ADD CONSTRAINT configuracoes_globais_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4407 (class 2606 OID 31279)
-- Name: landing_pages landing_pages_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.landing_pages
    ADD CONSTRAINT landing_pages_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4203 (class 2606 OID 29969)
-- Name: log_sistema log_sistema_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.log_sistema
    ADD CONSTRAINT log_sistema_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4205 (class 2606 OID 29971)
-- Name: log_sistema log_sistema_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.log_sistema
    ADD CONSTRAINT log_sistema_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4164 (class 2606 OID 29764)
-- Name: lojas lojas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.lojas
    ADD CONSTRAINT lojas_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4166 (class 2606 OID 29766)
-- Name: lojas lojas_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.lojas
    ADD CONSTRAINT lojas_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4168 (class 2606 OID 29770)
-- Name: lojas lojas_tenant_id_cnpj_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.lojas
    ADD CONSTRAINT lojas_tenant_id_cnpj_key UNIQUE (tenant_id, cnpj);


--
-- TOC entry 4170 (class 2606 OID 29768)
-- Name: lojas lojas_tenant_id_numero_identificador_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.lojas
    ADD CONSTRAINT lojas_tenant_id_numero_identificador_key UNIQUE (tenant_id, numero_identificador);


--
-- TOC entry 4426 (class 2606 OID 53022)
-- Name: matricula_turmas matricula_turmas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.matricula_turmas
    ADD CONSTRAINT matricula_turmas_pkey PRIMARY KEY (matricula_id, turma_id);


--
-- TOC entry 4424 (class 2606 OID 53006)
-- Name: matriculas matriculas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.matriculas
    ADD CONSTRAINT matriculas_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4385 (class 2606 OID 30972)
-- Name: mesas mesas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.mesas
    ADD CONSTRAINT mesas_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4387 (class 2606 OID 30974)
-- Name: mesas mesas_tenant_id_numero_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.mesas
    ADD CONSTRAINT mesas_tenant_id_numero_key UNIQUE (tenant_id, numero);


--
-- TOC entry 4403 (class 2606 OID 31182)
-- Name: notificacoes_lidas notificacoes_lidas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.notificacoes_lidas
    ADD CONSTRAINT notificacoes_lidas_pkey PRIMARY KEY (notificacao_id, usuario_id);


--
-- TOC entry 4400 (class 2606 OID 31096)
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4414 (class 2606 OID 31446)
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4214 (class 2606 OID 30014)
-- Name: people_addresses people_addresses_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_addresses
    ADD CONSTRAINT people_addresses_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4216 (class 2606 OID 30016)
-- Name: people_addresses people_addresses_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_addresses
    ADD CONSTRAINT people_addresses_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4224 (class 2606 OID 30066)
-- Name: people_bank_accounts people_bank_accounts_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_bank_accounts
    ADD CONSTRAINT people_bank_accounts_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4226 (class 2606 OID 30068)
-- Name: people_bank_accounts people_bank_accounts_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_bank_accounts
    ADD CONSTRAINT people_bank_accounts_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4219 (class 2606 OID 30040)
-- Name: people_contacts people_contacts_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_contacts
    ADD CONSTRAINT people_contacts_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4221 (class 2606 OID 30042)
-- Name: people_contacts people_contacts_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_contacts
    ADD CONSTRAINT people_contacts_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4234 (class 2606 OID 30116)
-- Name: people_details people_details_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_details
    ADD CONSTRAINT people_details_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4236 (class 2606 OID 30118)
-- Name: people_details people_details_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_details
    ADD CONSTRAINT people_details_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4229 (class 2606 OID 30091)
-- Name: people_documents people_documents_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_documents
    ADD CONSTRAINT people_documents_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4231 (class 2606 OID 30093)
-- Name: people_documents people_documents_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_documents
    ADD CONSTRAINT people_documents_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4209 (class 2606 OID 29994)
-- Name: people people_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4239 (class 2606 OID 30142)
-- Name: people_relationship_types people_relationship_types_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationship_types
    ADD CONSTRAINT people_relationship_types_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4241 (class 2606 OID 30144)
-- Name: people_relationship_types people_relationship_types_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationship_types
    ADD CONSTRAINT people_relationship_types_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4245 (class 2606 OID 30160)
-- Name: people_relationships people_relationships_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationships
    ADD CONSTRAINT people_relationships_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4247 (class 2606 OID 30162)
-- Name: people_relationships people_relationships_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationships
    ADD CONSTRAINT people_relationships_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4211 (class 2606 OID 29996)
-- Name: people people_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people
    ADD CONSTRAINT people_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4251 (class 2606 OID 30197)
-- Name: pluvyt_clients pluvyt_clients_person_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pluvyt_clients
    ADD CONSTRAINT pluvyt_clients_person_id_key UNIQUE (person_id);


--
-- TOC entry 4253 (class 2606 OID 30195)
-- Name: pluvyt_clients pluvyt_clients_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pluvyt_clients
    ADD CONSTRAINT pluvyt_clients_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4375 (class 2606 OID 30743)
-- Name: point_transactions point_transactions_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.point_transactions
    ADD CONSTRAINT point_transactions_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4377 (class 2606 OID 30745)
-- Name: point_transactions point_transactions_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.point_transactions
    ADD CONSTRAINT point_transactions_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4409 (class 2606 OID 31396)
-- Name: product_lists product_lists_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.product_lists
    ADD CONSTRAINT product_lists_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4297 (class 2606 OID 30383)
-- Name: produtos_categoria_category_enum produtos_categoria_category_enum_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_categoria_category_enum
    ADD CONSTRAINT produtos_categoria_category_enum_code_key UNIQUE (code);


--
-- TOC entry 4299 (class 2606 OID 30379)
-- Name: produtos_categoria_category_enum produtos_categoria_category_enum_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_categoria_category_enum
    ADD CONSTRAINT produtos_categoria_category_enum_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4301 (class 2606 OID 30381)
-- Name: produtos_categoria_category_enum produtos_categoria_category_enum_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_categoria_category_enum
    ADD CONSTRAINT produtos_categoria_category_enum_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4279 (class 2606 OID 30314)
-- Name: produtos_classe_produto_category_enum produtos_classe_produto_category_enum_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_classe_produto_category_enum
    ADD CONSTRAINT produtos_classe_produto_category_enum_code_key UNIQUE (code);


--
-- TOC entry 4281 (class 2606 OID 30310)
-- Name: produtos_classe_produto_category_enum produtos_classe_produto_category_enum_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_classe_produto_category_enum
    ADD CONSTRAINT produtos_classe_produto_category_enum_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4283 (class 2606 OID 30312)
-- Name: produtos_classe_produto_category_enum produtos_classe_produto_category_enum_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_classe_produto_category_enum
    ADD CONSTRAINT produtos_classe_produto_category_enum_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4324 (class 2606 OID 30495)
-- Name: produtos_ficha_tecnica produtos_ficha_tecnica_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_ficha_tecnica
    ADD CONSTRAINT produtos_ficha_tecnica_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4326 (class 2606 OID 30497)
-- Name: produtos_ficha_tecnica produtos_ficha_tecnica_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_ficha_tecnica
    ADD CONSTRAINT produtos_ficha_tecnica_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4317 (class 2606 OID 30463)
-- Name: produtos_fiscal produtos_fiscal_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_fiscal
    ADD CONSTRAINT produtos_fiscal_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4319 (class 2606 OID 30467)
-- Name: produtos_fiscal produtos_fiscal_produto_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_fiscal
    ADD CONSTRAINT produtos_fiscal_produto_id_key UNIQUE (produto_id);


--
-- TOC entry 4321 (class 2606 OID 30465)
-- Name: produtos_fiscal produtos_fiscal_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_fiscal
    ADD CONSTRAINT produtos_fiscal_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4355 (class 2606 OID 30633)
-- Name: produtos_kit produtos_kit_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_kit
    ADD CONSTRAINT produtos_kit_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4357 (class 2606 OID 30635)
-- Name: produtos_kit produtos_kit_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_kit
    ADD CONSTRAINT produtos_kit_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4329 (class 2606 OID 30522)
-- Name: produtos_logistica produtos_logistica_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_logistica
    ADD CONSTRAINT produtos_logistica_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4331 (class 2606 OID 30526)
-- Name: produtos_logistica produtos_logistica_produto_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_logistica
    ADD CONSTRAINT produtos_logistica_produto_id_key UNIQUE (produto_id);


--
-- TOC entry 4333 (class 2606 OID 30524)
-- Name: produtos_logistica produtos_logistica_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_logistica
    ADD CONSTRAINT produtos_logistica_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4350 (class 2606 OID 30605)
-- Name: produtos_media produtos_media_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media
    ADD CONSTRAINT produtos_media_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4352 (class 2606 OID 30607)
-- Name: produtos_media produtos_media_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media
    ADD CONSTRAINT produtos_media_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4303 (class 2606 OID 30406)
-- Name: produtos_media_tipo_category_enum produtos_media_tipo_category_enum_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media_tipo_category_enum
    ADD CONSTRAINT produtos_media_tipo_category_enum_code_key UNIQUE (code);


--
-- TOC entry 4305 (class 2606 OID 30402)
-- Name: produtos_media_tipo_category_enum produtos_media_tipo_category_enum_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media_tipo_category_enum
    ADD CONSTRAINT produtos_media_tipo_category_enum_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4307 (class 2606 OID 30404)
-- Name: produtos_media_tipo_category_enum produtos_media_tipo_category_enum_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media_tipo_category_enum
    ADD CONSTRAINT produtos_media_tipo_category_enum_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4285 (class 2606 OID 30337)
-- Name: produtos_origem_category_enum produtos_origem_category_enum_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_origem_category_enum
    ADD CONSTRAINT produtos_origem_category_enum_code_key UNIQUE (code);


--
-- TOC entry 4287 (class 2606 OID 30333)
-- Name: produtos_origem_category_enum produtos_origem_category_enum_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_origem_category_enum
    ADD CONSTRAINT produtos_origem_category_enum_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4289 (class 2606 OID 30335)
-- Name: produtos_origem_category_enum produtos_origem_category_enum_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_origem_category_enum
    ADD CONSTRAINT produtos_origem_category_enum_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4312 (class 2606 OID 30424)
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4336 (class 2606 OID 30552)
-- Name: produtos_precos produtos_precos_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_precos
    ADD CONSTRAINT produtos_precos_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4338 (class 2606 OID 30556)
-- Name: produtos_precos produtos_precos_produto_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_precos
    ADD CONSTRAINT produtos_precos_produto_id_key UNIQUE (produto_id);


--
-- TOC entry 4340 (class 2606 OID 30554)
-- Name: produtos_precos produtos_precos_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_precos
    ADD CONSTRAINT produtos_precos_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4343 (class 2606 OID 30578)
-- Name: produtos_seo produtos_seo_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_seo
    ADD CONSTRAINT produtos_seo_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4345 (class 2606 OID 30582)
-- Name: produtos_seo produtos_seo_produto_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_seo
    ADD CONSTRAINT produtos_seo_produto_id_key UNIQUE (produto_id);


--
-- TOC entry 4347 (class 2606 OID 30580)
-- Name: produtos_seo produtos_seo_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_seo
    ADD CONSTRAINT produtos_seo_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4314 (class 2606 OID 30426)
-- Name: produtos produtos_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos
    ADD CONSTRAINT produtos_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4273 (class 2606 OID 30291)
-- Name: produtos_situacao_category_enum produtos_situacao_category_enum_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_situacao_category_enum
    ADD CONSTRAINT produtos_situacao_category_enum_code_key UNIQUE (code);


--
-- TOC entry 4275 (class 2606 OID 30287)
-- Name: produtos_situacao_category_enum produtos_situacao_category_enum_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_situacao_category_enum
    ADD CONSTRAINT produtos_situacao_category_enum_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4277 (class 2606 OID 30289)
-- Name: produtos_situacao_category_enum produtos_situacao_category_enum_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_situacao_category_enum
    ADD CONSTRAINT produtos_situacao_category_enum_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4267 (class 2606 OID 30268)
-- Name: produtos_tipo_category_enum produtos_tipo_category_enum_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_category_enum
    ADD CONSTRAINT produtos_tipo_category_enum_code_key UNIQUE (code);


--
-- TOC entry 4269 (class 2606 OID 30264)
-- Name: produtos_tipo_category_enum produtos_tipo_category_enum_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_category_enum
    ADD CONSTRAINT produtos_tipo_category_enum_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4271 (class 2606 OID 30266)
-- Name: produtos_tipo_category_enum produtos_tipo_category_enum_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_category_enum
    ADD CONSTRAINT produtos_tipo_category_enum_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4291 (class 2606 OID 30360)
-- Name: produtos_tipo_embalagem_category_enum produtos_tipo_embalagem_category_enum_code_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_embalagem_category_enum
    ADD CONSTRAINT produtos_tipo_embalagem_category_enum_code_key UNIQUE (code);


--
-- TOC entry 4293 (class 2606 OID 30356)
-- Name: produtos_tipo_embalagem_category_enum produtos_tipo_embalagem_category_enum_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_embalagem_category_enum
    ADD CONSTRAINT produtos_tipo_embalagem_category_enum_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4295 (class 2606 OID 30358)
-- Name: produtos_tipo_embalagem_category_enum produtos_tipo_embalagem_category_enum_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_embalagem_category_enum
    ADD CONSTRAINT produtos_tipo_embalagem_category_enum_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4360 (class 2606 OID 30662)
-- Name: produtos_variacoes produtos_variacoes_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_variacoes
    ADD CONSTRAINT produtos_variacoes_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4362 (class 2606 OID 30664)
-- Name: produtos_variacoes produtos_variacoes_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_variacoes
    ADD CONSTRAINT produtos_variacoes_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4366 (class 2606 OID 30707)
-- Name: produtos_recompensas recompensas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_recompensas
    ADD CONSTRAINT recompensas_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4368 (class 2606 OID 30711)
-- Name: produtos_recompensas recompensas_produto_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_recompensas
    ADD CONSTRAINT recompensas_produto_id_key UNIQUE (produto_id);


--
-- TOC entry 4370 (class 2606 OID 30709)
-- Name: produtos_recompensas recompensas_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_recompensas
    ADD CONSTRAINT recompensas_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4191 (class 2606 OID 29915)
-- Name: remetentes_smtp remetentes_smtp_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.remetentes_smtp
    ADD CONSTRAINT remetentes_smtp_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4193 (class 2606 OID 29917)
-- Name: remetentes_smtp remetentes_smtp_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.remetentes_smtp
    ADD CONSTRAINT remetentes_smtp_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4416 (class 2606 OID 52316)
-- Name: restaurante_metas restaurante_metas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.restaurante_metas
    ADD CONSTRAINT restaurante_metas_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4418 (class 2606 OID 52318)
-- Name: restaurante_metas restaurante_metas_tenant_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.restaurante_metas
    ADD CONSTRAINT restaurante_metas_tenant_id_key UNIQUE (tenant_id);


--
-- TOC entry 4256 (class 2606 OID 30221)
-- Name: tenant_addresses tenant_addresses_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_addresses
    ADD CONSTRAINT tenant_addresses_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4258 (class 2606 OID 30223)
-- Name: tenant_addresses tenant_addresses_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_addresses
    ADD CONSTRAINT tenant_addresses_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4260 (class 2606 OID 30225)
-- Name: tenant_addresses tenant_addresses_tenant_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_addresses
    ADD CONSTRAINT tenant_addresses_tenant_id_key UNIQUE (tenant_id);


--
-- TOC entry 4263 (class 2606 OID 30241)
-- Name: tenant_contacts tenant_contacts_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_contacts
    ADD CONSTRAINT tenant_contacts_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4265 (class 2606 OID 30243)
-- Name: tenant_contacts tenant_contacts_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_contacts
    ADD CONSTRAINT tenant_contacts_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4131 (class 2606 OID 29652)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4133 (class 2606 OID 29654)
-- Name: tenants tenants_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenants
    ADD CONSTRAINT tenants_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4135 (class 2606 OID 29656)
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- TOC entry 4422 (class 2606 OID 52986)
-- Name: turma_inscritos turma_inscritos_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.turma_inscritos
    ADD CONSTRAINT turma_inscritos_pkey PRIMARY KEY (turma_id, pessoa_id);


--
-- TOC entry 4420 (class 2606 OID 52970)
-- Name: turmas turmas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.turmas
    ADD CONSTRAINT turmas_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4138 (class 2606 OID 29670)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uuid);


--
-- TOC entry 4140 (class 2606 OID 29672)
-- Name: users users_seq_id_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_seq_id_key UNIQUE (seq_id);


--
-- TOC entry 4142 (class 2606 OID 29676)
-- Name: users users_tenant_id_email_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- TOC entry 4144 (class 2606 OID 29674)
-- Name: users users_tenant_id_login_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_tenant_id_login_key UNIQUE (tenant_id, login);


--
-- TOC entry 4151 (class 1259 OID 29978)
-- Name: idx_access_groups_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_access_groups_tenant_id ON app.access_groups USING btree (tenant_id);


--
-- TOC entry 4200 (class 1259 OID 29982)
-- Name: idx_campanhas_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_campanhas_tenant_id ON app.campanhas_disparo USING btree (tenant_id);


--
-- TOC entry 4382 (class 1259 OID 30832)
-- Name: idx_cardapio_itens_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_cardapio_itens_tenant ON app.produtos_cardapio USING btree (tenant_id);


--
-- TOC entry 4179 (class 1259 OID 29980)
-- Name: idx_clientes_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_clientes_tenant_id ON app.clientes USING btree (tenant_id);


--
-- TOC entry 4395 (class 1259 OID 31038)
-- Name: idx_comanda_itens_comanda; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_comanda_itens_comanda ON app.comanda_itens USING btree (comanda_id);


--
-- TOC entry 4396 (class 1259 OID 31465)
-- Name: idx_comanda_itens_pedido; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_comanda_itens_pedido ON app.comanda_itens USING btree (pedido_id);


--
-- TOC entry 4390 (class 1259 OID 31007)
-- Name: idx_comandas_mesa; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_comandas_mesa ON app.comandas USING btree (mesa_id);


--
-- TOC entry 4391 (class 1259 OID 31008)
-- Name: idx_comandas_status; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_comandas_status ON app.comandas USING btree (status);


--
-- TOC entry 4392 (class 1259 OID 31006)
-- Name: idx_comandas_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_comandas_tenant ON app.comandas USING btree (tenant_id);


--
-- TOC entry 4404 (class 1259 OID 31281)
-- Name: idx_landing_pages_slug_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE UNIQUE INDEX idx_landing_pages_slug_tenant ON app.landing_pages USING btree (tenant_id, slug);


--
-- TOC entry 4405 (class 1259 OID 31280)
-- Name: idx_landing_pages_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_landing_pages_tenant ON app.landing_pages USING btree (tenant_id);


--
-- TOC entry 4201 (class 1259 OID 29981)
-- Name: idx_logs_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_logs_tenant_id ON app.log_sistema USING btree (tenant_id);


--
-- TOC entry 4162 (class 1259 OID 29979)
-- Name: idx_lojas_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_lojas_tenant_id ON app.lojas USING btree (tenant_id);


--
-- TOC entry 4383 (class 1259 OID 30980)
-- Name: idx_mesas_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_mesas_tenant ON app.mesas USING btree (tenant_id);


--
-- TOC entry 4397 (class 1259 OID 31103)
-- Name: idx_notificacoes_lida; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_notificacoes_lida ON app.notificacoes USING btree (lida);


--
-- TOC entry 4401 (class 1259 OID 31193)
-- Name: idx_notificacoes_lidas_usuario; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_notificacoes_lidas_usuario ON app.notificacoes_lidas USING btree (usuario_id);


--
-- TOC entry 4398 (class 1259 OID 31102)
-- Name: idx_notificacoes_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_notificacoes_tenant ON app.notificacoes USING btree (tenant_id);


--
-- TOC entry 4410 (class 1259 OID 31458)
-- Name: idx_pedidos_comanda; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_pedidos_comanda ON app.pedidos USING btree (comanda_id);


--
-- TOC entry 4411 (class 1259 OID 31459)
-- Name: idx_pedidos_status; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_pedidos_status ON app.pedidos USING btree (status);


--
-- TOC entry 4412 (class 1259 OID 31457)
-- Name: idx_pedidos_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_pedidos_tenant ON app.pedidos USING btree (tenant_id);


--
-- TOC entry 4212 (class 1259 OID 30027)
-- Name: idx_people_addresses_people_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_people_addresses_people_id ON app.people_addresses USING btree (people_id);


--
-- TOC entry 4222 (class 1259 OID 30079)
-- Name: idx_people_bank_accounts_people_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_people_bank_accounts_people_id ON app.people_bank_accounts USING btree (people_id);


--
-- TOC entry 4217 (class 1259 OID 30053)
-- Name: idx_people_contacts_people_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_people_contacts_people_id ON app.people_contacts USING btree (people_id);


--
-- TOC entry 4232 (class 1259 OID 30129)
-- Name: idx_people_details_people_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_people_details_people_id ON app.people_details USING btree (people_id);


--
-- TOC entry 4227 (class 1259 OID 30104)
-- Name: idx_people_documents_people_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_people_documents_people_id ON app.people_documents USING btree (people_id);


--
-- TOC entry 4206 (class 1259 OID 30002)
-- Name: idx_people_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_people_tenant_id ON app.people USING btree (tenant_id);


--
-- TOC entry 4207 (class 1259 OID 30729)
-- Name: idx_people_usuario_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_people_usuario_id ON app.people USING btree (usuario_id);


--
-- TOC entry 4248 (class 1259 OID 30209)
-- Name: idx_pluvyt_clients_person_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_pluvyt_clients_person_id ON app.pluvyt_clients USING btree (person_id);


--
-- TOC entry 4249 (class 1259 OID 30208)
-- Name: idx_pluvyt_clients_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_pluvyt_clients_tenant_id ON app.pluvyt_clients USING btree (tenant_id);


--
-- TOC entry 4371 (class 1259 OID 30762)
-- Name: idx_point_transactions_client_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_point_transactions_client_id ON app.point_transactions USING btree (client_id);


--
-- TOC entry 4372 (class 1259 OID 30763)
-- Name: idx_point_transactions_created_at; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_point_transactions_created_at ON app.point_transactions USING btree (created_at);


--
-- TOC entry 4373 (class 1259 OID 30761)
-- Name: idx_point_transactions_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_point_transactions_tenant_id ON app.point_transactions USING btree (tenant_id);


--
-- TOC entry 4308 (class 1259 OID 30681)
-- Name: idx_produtos_codigo; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_codigo ON app.produtos USING btree (codigo);


--
-- TOC entry 4322 (class 1259 OID 30684)
-- Name: idx_produtos_ficha_tecnica_produto; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_ficha_tecnica_produto ON app.produtos_ficha_tecnica USING btree (produto_id);


--
-- TOC entry 4315 (class 1259 OID 30683)
-- Name: idx_produtos_fiscal_produto; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_fiscal_produto ON app.produtos_fiscal USING btree (produto_id);


--
-- TOC entry 4353 (class 1259 OID 30689)
-- Name: idx_produtos_kit_pai; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_kit_pai ON app.produtos_kit USING btree (produto_pai_id);


--
-- TOC entry 4327 (class 1259 OID 30685)
-- Name: idx_produtos_logistica_produto; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_logistica_produto ON app.produtos_logistica USING btree (produto_id);


--
-- TOC entry 4348 (class 1259 OID 30688)
-- Name: idx_produtos_media_produto; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_media_produto ON app.produtos_media USING btree (produto_id);


--
-- TOC entry 4309 (class 1259 OID 30682)
-- Name: idx_produtos_nome; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_nome ON app.produtos USING btree (nome);


--
-- TOC entry 4334 (class 1259 OID 30686)
-- Name: idx_produtos_precos_produto; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_precos_produto ON app.produtos_precos USING btree (produto_id);


--
-- TOC entry 4341 (class 1259 OID 30687)
-- Name: idx_produtos_seo_produto; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_seo_produto ON app.produtos_seo USING btree (produto_id);


--
-- TOC entry 4310 (class 1259 OID 30680)
-- Name: idx_produtos_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_tenant ON app.produtos USING btree (tenant_id);


--
-- TOC entry 4358 (class 1259 OID 30690)
-- Name: idx_produtos_variacoes_pai; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_produtos_variacoes_pai ON app.produtos_variacoes USING btree (produto_pai_id);


--
-- TOC entry 4363 (class 1259 OID 30723)
-- Name: idx_recompensas_produto; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_recompensas_produto ON app.produtos_recompensas USING btree (produto_id);


--
-- TOC entry 4364 (class 1259 OID 30722)
-- Name: idx_recompensas_tenant; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_recompensas_tenant ON app.produtos_recompensas USING btree (tenant_id);


--
-- TOC entry 4237 (class 1259 OID 30150)
-- Name: idx_relationship_types_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_relationship_types_tenant_id ON app.people_relationship_types USING btree (tenant_id);


--
-- TOC entry 4242 (class 1259 OID 30183)
-- Name: idx_relationships_source; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_relationships_source ON app.people_relationships USING btree (people_id_source);


--
-- TOC entry 4243 (class 1259 OID 30184)
-- Name: idx_relationships_target; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_relationships_target ON app.people_relationships USING btree (people_id_target);


--
-- TOC entry 4254 (class 1259 OID 30249)
-- Name: idx_tenant_addresses_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_tenant_addresses_tenant_id ON app.tenant_addresses USING btree (tenant_id);


--
-- TOC entry 4261 (class 1259 OID 30250)
-- Name: idx_tenant_contacts_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_tenant_contacts_tenant_id ON app.tenant_contacts USING btree (tenant_id);


--
-- TOC entry 4129 (class 1259 OID 31510)
-- Name: idx_tenants_pessoa; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_tenants_pessoa ON app.tenants USING btree (pessoa_id);


--
-- TOC entry 4136 (class 1259 OID 29977)
-- Name: idx_users_tenant_id; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_users_tenant_id ON app.users USING btree (tenant_id);


--
-- TOC entry 4538 (class 2606 OID 53045)
-- Name: academia_questionario_templates academia_questionario_templates_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.academia_questionario_templates
    ADD CONSTRAINT academia_questionario_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4434 (class 2606 OID 29729)
-- Name: access_group_memberships access_group_memberships_group_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_group_memberships
    ADD CONSTRAINT access_group_memberships_group_id_fkey FOREIGN KEY (group_id) REFERENCES app.access_groups(uuid) ON DELETE CASCADE;


--
-- TOC entry 4435 (class 2606 OID 29719)
-- Name: access_group_memberships access_group_memberships_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_group_memberships
    ADD CONSTRAINT access_group_memberships_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4436 (class 2606 OID 29724)
-- Name: access_group_memberships access_group_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_group_memberships
    ADD CONSTRAINT access_group_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES app.users(uuid) ON DELETE CASCADE;


--
-- TOC entry 4433 (class 2606 OID 29700)
-- Name: access_groups access_groups_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.access_groups
    ADD CONSTRAINT access_groups_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4449 (class 2606 OID 29953)
-- Name: campanhas_disparo campanhas_disparo_remetente_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.campanhas_disparo
    ADD CONSTRAINT campanhas_disparo_remetente_id_fkey FOREIGN KEY (remetente_id) REFERENCES app.remetentes_smtp(uuid);


--
-- TOC entry 4450 (class 2606 OID 29948)
-- Name: campanhas_disparo campanhas_disparo_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.campanhas_disparo
    ADD CONSTRAINT campanhas_disparo_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4513 (class 2606 OID 30822)
-- Name: produtos_cardapio cardapio_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_cardapio
    ADD CONSTRAINT cardapio_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4514 (class 2606 OID 30817)
-- Name: produtos_cardapio cardapio_itens_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_cardapio
    ADD CONSTRAINT cardapio_itens_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4442 (class 2606 OID 29853)
-- Name: cliente_pontos_movimentacao cliente_pontos_movimentacao_id_cliente_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cliente_pontos_movimentacao
    ADD CONSTRAINT cliente_pontos_movimentacao_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES app.clientes(uuid) ON DELETE CASCADE;


--
-- TOC entry 4443 (class 2606 OID 29858)
-- Name: cliente_pontos_movimentacao cliente_pontos_movimentacao_id_loja_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cliente_pontos_movimentacao
    ADD CONSTRAINT cliente_pontos_movimentacao_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES app.lojas(uuid);


--
-- TOC entry 4444 (class 2606 OID 29848)
-- Name: cliente_pontos_movimentacao cliente_pontos_movimentacao_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cliente_pontos_movimentacao
    ADD CONSTRAINT cliente_pontos_movimentacao_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4439 (class 2606 OID 29807)
-- Name: clientes clientes_id_loja_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes
    ADD CONSTRAINT clientes_id_loja_fkey FOREIGN KEY (id_loja) REFERENCES app.lojas(uuid) ON DELETE SET NULL;


--
-- TOC entry 4440 (class 2606 OID 29802)
-- Name: clientes clientes_id_usuario_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes
    ADD CONSTRAINT clientes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES app.users(uuid) ON DELETE CASCADE;


--
-- TOC entry 4445 (class 2606 OID 29888)
-- Name: clientes_itens_recompensa clientes_itens_recompensa_id_cliente_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes_itens_recompensa
    ADD CONSTRAINT clientes_itens_recompensa_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES app.clientes(uuid) ON DELETE CASCADE;


--
-- TOC entry 4446 (class 2606 OID 29898)
-- Name: clientes_itens_recompensa clientes_itens_recompensa_id_movimentacao_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes_itens_recompensa
    ADD CONSTRAINT clientes_itens_recompensa_id_movimentacao_fkey FOREIGN KEY (id_movimentacao) REFERENCES app.cliente_pontos_movimentacao(uuid) ON DELETE SET NULL;


--
-- TOC entry 4447 (class 2606 OID 29883)
-- Name: clientes_itens_recompensa clientes_itens_recompensa_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes_itens_recompensa
    ADD CONSTRAINT clientes_itens_recompensa_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4441 (class 2606 OID 29797)
-- Name: clientes clientes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.clientes
    ADD CONSTRAINT clientes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4518 (class 2606 OID 31028)
-- Name: comanda_itens comanda_itens_comanda_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comanda_itens
    ADD CONSTRAINT comanda_itens_comanda_id_fkey FOREIGN KEY (comanda_id) REFERENCES app.comandas(uuid) ON DELETE CASCADE;


--
-- TOC entry 4519 (class 2606 OID 31460)
-- Name: comanda_itens comanda_itens_pedido_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comanda_itens
    ADD CONSTRAINT comanda_itens_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES app.pedidos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4520 (class 2606 OID 31033)
-- Name: comanda_itens comanda_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comanda_itens
    ADD CONSTRAINT comanda_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4521 (class 2606 OID 31023)
-- Name: comanda_itens comanda_itens_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comanda_itens
    ADD CONSTRAINT comanda_itens_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4516 (class 2606 OID 31001)
-- Name: comandas comandas_mesa_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comandas
    ADD CONSTRAINT comandas_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES app.mesas(uuid) ON DELETE CASCADE;


--
-- TOC entry 4517 (class 2606 OID 30996)
-- Name: comandas comandas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.comandas
    ADD CONSTRAINT comandas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4437 (class 2606 OID 29748)
-- Name: configuracoes_globais configuracoes_globais_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.configuracoes_globais
    ADD CONSTRAINT configuracoes_globais_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4525 (class 2606 OID 31282)
-- Name: landing_pages fk_landing_pages_tenant_id; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.landing_pages
    ADD CONSTRAINT fk_landing_pages_tenant_id FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4451 (class 2606 OID 29972)
-- Name: log_sistema log_sistema_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.log_sistema
    ADD CONSTRAINT log_sistema_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4438 (class 2606 OID 29771)
-- Name: lojas lojas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.lojas
    ADD CONSTRAINT lojas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4536 (class 2606 OID 53023)
-- Name: matricula_turmas matricula_turmas_matricula_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.matricula_turmas
    ADD CONSTRAINT matricula_turmas_matricula_id_fkey FOREIGN KEY (matricula_id) REFERENCES app.matriculas(uuid) ON DELETE CASCADE;


--
-- TOC entry 4537 (class 2606 OID 53028)
-- Name: matricula_turmas matricula_turmas_turma_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.matricula_turmas
    ADD CONSTRAINT matricula_turmas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES app.turmas(uuid) ON DELETE CASCADE;


--
-- TOC entry 4534 (class 2606 OID 53012)
-- Name: matriculas matriculas_aluno_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.matriculas
    ADD CONSTRAINT matriculas_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4535 (class 2606 OID 53007)
-- Name: matriculas matriculas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.matriculas
    ADD CONSTRAINT matriculas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4515 (class 2606 OID 30975)
-- Name: mesas mesas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.mesas
    ADD CONSTRAINT mesas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4523 (class 2606 OID 31183)
-- Name: notificacoes_lidas notificacoes_lidas_notificacao_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.notificacoes_lidas
    ADD CONSTRAINT notificacoes_lidas_notificacao_id_fkey FOREIGN KEY (notificacao_id) REFERENCES app.notificacoes(uuid) ON DELETE CASCADE;


--
-- TOC entry 4524 (class 2606 OID 31188)
-- Name: notificacoes_lidas notificacoes_lidas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.notificacoes_lidas
    ADD CONSTRAINT notificacoes_lidas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES app.users(uuid) ON DELETE CASCADE;


--
-- TOC entry 4522 (class 2606 OID 31097)
-- Name: notificacoes notificacoes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.notificacoes
    ADD CONSTRAINT notificacoes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4527 (class 2606 OID 31452)
-- Name: pedidos pedidos_comanda_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pedidos
    ADD CONSTRAINT pedidos_comanda_id_fkey FOREIGN KEY (comanda_id) REFERENCES app.comandas(uuid) ON DELETE CASCADE;


--
-- TOC entry 4528 (class 2606 OID 31447)
-- Name: pedidos pedidos_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pedidos
    ADD CONSTRAINT pedidos_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4454 (class 2606 OID 30017)
-- Name: people_addresses people_addresses_people_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_addresses
    ADD CONSTRAINT people_addresses_people_id_fkey FOREIGN KEY (people_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4455 (class 2606 OID 30022)
-- Name: people_addresses people_addresses_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_addresses
    ADD CONSTRAINT people_addresses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4458 (class 2606 OID 30069)
-- Name: people_bank_accounts people_bank_accounts_people_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_bank_accounts
    ADD CONSTRAINT people_bank_accounts_people_id_fkey FOREIGN KEY (people_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4459 (class 2606 OID 30074)
-- Name: people_bank_accounts people_bank_accounts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_bank_accounts
    ADD CONSTRAINT people_bank_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4456 (class 2606 OID 30043)
-- Name: people_contacts people_contacts_people_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_contacts
    ADD CONSTRAINT people_contacts_people_id_fkey FOREIGN KEY (people_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4457 (class 2606 OID 30048)
-- Name: people_contacts people_contacts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_contacts
    ADD CONSTRAINT people_contacts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4462 (class 2606 OID 30119)
-- Name: people_details people_details_people_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_details
    ADD CONSTRAINT people_details_people_id_fkey FOREIGN KEY (people_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4463 (class 2606 OID 30124)
-- Name: people_details people_details_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_details
    ADD CONSTRAINT people_details_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4460 (class 2606 OID 30094)
-- Name: people_documents people_documents_people_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_documents
    ADD CONSTRAINT people_documents_people_id_fkey FOREIGN KEY (people_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4461 (class 2606 OID 30099)
-- Name: people_documents people_documents_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_documents
    ADD CONSTRAINT people_documents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4464 (class 2606 OID 30145)
-- Name: people_relationship_types people_relationship_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationship_types
    ADD CONSTRAINT people_relationship_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4465 (class 2606 OID 30168)
-- Name: people_relationships people_relationships_people_id_source_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationships
    ADD CONSTRAINT people_relationships_people_id_source_fkey FOREIGN KEY (people_id_source) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4466 (class 2606 OID 30173)
-- Name: people_relationships people_relationships_people_id_target_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationships
    ADD CONSTRAINT people_relationships_people_id_target_fkey FOREIGN KEY (people_id_target) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4467 (class 2606 OID 30163)
-- Name: people_relationships people_relationships_people_relationship_types_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationships
    ADD CONSTRAINT people_relationships_people_relationship_types_id_fkey FOREIGN KEY (people_relationship_types_id) REFERENCES app.people_relationship_types(uuid) ON DELETE CASCADE;


--
-- TOC entry 4468 (class 2606 OID 30178)
-- Name: people_relationships people_relationships_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people_relationships
    ADD CONSTRAINT people_relationships_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4452 (class 2606 OID 29997)
-- Name: people people_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people
    ADD CONSTRAINT people_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4453 (class 2606 OID 30724)
-- Name: people people_usuario_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.people
    ADD CONSTRAINT people_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES app.users(uuid) ON DELETE SET NULL;


--
-- TOC entry 4469 (class 2606 OID 30203)
-- Name: pluvyt_clients pluvyt_clients_person_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pluvyt_clients
    ADD CONSTRAINT pluvyt_clients_person_id_fkey FOREIGN KEY (person_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4470 (class 2606 OID 30198)
-- Name: pluvyt_clients pluvyt_clients_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.pluvyt_clients
    ADD CONSTRAINT pluvyt_clients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4509 (class 2606 OID 30764)
-- Name: point_transactions point_transactions_client_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.point_transactions
    ADD CONSTRAINT point_transactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES app.pluvyt_clients(uuid) ON DELETE CASCADE;


--
-- TOC entry 4510 (class 2606 OID 30769)
-- Name: point_transactions point_transactions_loja_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.point_transactions
    ADD CONSTRAINT point_transactions_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES app.tenants(uuid) ON DELETE SET NULL;


--
-- TOC entry 4511 (class 2606 OID 31466)
-- Name: point_transactions point_transactions_reward_item_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.point_transactions
    ADD CONSTRAINT point_transactions_reward_item_id_fkey FOREIGN KEY (reward_item_id) REFERENCES app.produtos_recompensas(uuid) ON DELETE SET NULL;


--
-- TOC entry 4512 (class 2606 OID 30746)
-- Name: point_transactions point_transactions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.point_transactions
    ADD CONSTRAINT point_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4526 (class 2606 OID 31397)
-- Name: product_lists product_lists_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.product_lists
    ADD CONSTRAINT product_lists_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4478 (class 2606 OID 52893)
-- Name: produtos_categoria_category_enum produtos_categoria_category_enum_parent_uuid_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_categoria_category_enum
    ADD CONSTRAINT produtos_categoria_category_enum_parent_uuid_fkey FOREIGN KEY (parent_uuid) REFERENCES app.produtos_categoria_category_enum(uuid);


--
-- TOC entry 4479 (class 2606 OID 30384)
-- Name: produtos_categoria_category_enum produtos_categoria_category_enum_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_categoria_category_enum
    ADD CONSTRAINT produtos_categoria_category_enum_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4481 (class 2606 OID 30447)
-- Name: produtos produtos_categoria_code_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos
    ADD CONSTRAINT produtos_categoria_code_fkey FOREIGN KEY (categoria_code) REFERENCES app.produtos_categoria_category_enum(code);


--
-- TOC entry 4475 (class 2606 OID 30315)
-- Name: produtos_classe_produto_category_enum produtos_classe_produto_category_enum_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_classe_produto_category_enum
    ADD CONSTRAINT produtos_classe_produto_category_enum_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4482 (class 2606 OID 30442)
-- Name: produtos produtos_classe_produto_code_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos
    ADD CONSTRAINT produtos_classe_produto_code_fkey FOREIGN KEY (classe_produto_code) REFERENCES app.produtos_classe_produto_category_enum(code);


--
-- TOC entry 4489 (class 2606 OID 30503)
-- Name: produtos_ficha_tecnica produtos_ficha_tecnica_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_ficha_tecnica
    ADD CONSTRAINT produtos_ficha_tecnica_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4490 (class 2606 OID 30498)
-- Name: produtos_ficha_tecnica produtos_ficha_tecnica_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_ficha_tecnica
    ADD CONSTRAINT produtos_ficha_tecnica_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4486 (class 2606 OID 30478)
-- Name: produtos_fiscal produtos_fiscal_origem_code_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_fiscal
    ADD CONSTRAINT produtos_fiscal_origem_code_fkey FOREIGN KEY (origem_code) REFERENCES app.produtos_origem_category_enum(code);


--
-- TOC entry 4487 (class 2606 OID 30473)
-- Name: produtos_fiscal produtos_fiscal_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_fiscal
    ADD CONSTRAINT produtos_fiscal_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4488 (class 2606 OID 30468)
-- Name: produtos_fiscal produtos_fiscal_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_fiscal
    ADD CONSTRAINT produtos_fiscal_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4501 (class 2606 OID 30646)
-- Name: produtos_kit produtos_kit_produto_filho_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_kit
    ADD CONSTRAINT produtos_kit_produto_filho_id_fkey FOREIGN KEY (produto_filho_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4502 (class 2606 OID 30641)
-- Name: produtos_kit produtos_kit_produto_pai_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_kit
    ADD CONSTRAINT produtos_kit_produto_pai_id_fkey FOREIGN KEY (produto_pai_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4503 (class 2606 OID 30636)
-- Name: produtos_kit produtos_kit_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_kit
    ADD CONSTRAINT produtos_kit_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4491 (class 2606 OID 30532)
-- Name: produtos_logistica produtos_logistica_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_logistica
    ADD CONSTRAINT produtos_logistica_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4492 (class 2606 OID 30527)
-- Name: produtos_logistica produtos_logistica_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_logistica
    ADD CONSTRAINT produtos_logistica_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4493 (class 2606 OID 30537)
-- Name: produtos_logistica produtos_logistica_tipo_embalagem_code_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_logistica
    ADD CONSTRAINT produtos_logistica_tipo_embalagem_code_fkey FOREIGN KEY (tipo_embalagem_code) REFERENCES app.produtos_tipo_embalagem_category_enum(code);


--
-- TOC entry 4498 (class 2606 OID 30613)
-- Name: produtos_media produtos_media_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media
    ADD CONSTRAINT produtos_media_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4499 (class 2606 OID 30608)
-- Name: produtos_media produtos_media_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media
    ADD CONSTRAINT produtos_media_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4480 (class 2606 OID 30407)
-- Name: produtos_media_tipo_category_enum produtos_media_tipo_category_enum_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media_tipo_category_enum
    ADD CONSTRAINT produtos_media_tipo_category_enum_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4500 (class 2606 OID 30618)
-- Name: produtos_media produtos_media_tipo_code_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_media
    ADD CONSTRAINT produtos_media_tipo_code_fkey FOREIGN KEY (tipo_code) REFERENCES app.produtos_media_tipo_category_enum(code);


--
-- TOC entry 4476 (class 2606 OID 30338)
-- Name: produtos_origem_category_enum produtos_origem_category_enum_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_origem_category_enum
    ADD CONSTRAINT produtos_origem_category_enum_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4494 (class 2606 OID 30562)
-- Name: produtos_precos produtos_precos_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_precos
    ADD CONSTRAINT produtos_precos_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4495 (class 2606 OID 30557)
-- Name: produtos_precos produtos_precos_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_precos
    ADD CONSTRAINT produtos_precos_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4496 (class 2606 OID 30588)
-- Name: produtos_seo produtos_seo_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_seo
    ADD CONSTRAINT produtos_seo_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4497 (class 2606 OID 30583)
-- Name: produtos_seo produtos_seo_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_seo
    ADD CONSTRAINT produtos_seo_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4474 (class 2606 OID 30292)
-- Name: produtos_situacao_category_enum produtos_situacao_category_enum_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_situacao_category_enum
    ADD CONSTRAINT produtos_situacao_category_enum_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4483 (class 2606 OID 30437)
-- Name: produtos produtos_situacao_code_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos
    ADD CONSTRAINT produtos_situacao_code_fkey FOREIGN KEY (situacao_code) REFERENCES app.produtos_situacao_category_enum(code);


--
-- TOC entry 4484 (class 2606 OID 30427)
-- Name: produtos produtos_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos
    ADD CONSTRAINT produtos_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4473 (class 2606 OID 30269)
-- Name: produtos_tipo_category_enum produtos_tipo_category_enum_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_category_enum
    ADD CONSTRAINT produtos_tipo_category_enum_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4485 (class 2606 OID 30432)
-- Name: produtos produtos_tipo_code_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos
    ADD CONSTRAINT produtos_tipo_code_fkey FOREIGN KEY (tipo_code) REFERENCES app.produtos_tipo_category_enum(code);


--
-- TOC entry 4477 (class 2606 OID 30361)
-- Name: produtos_tipo_embalagem_category_enum produtos_tipo_embalagem_category_enum_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_tipo_embalagem_category_enum
    ADD CONSTRAINT produtos_tipo_embalagem_category_enum_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid);


--
-- TOC entry 4504 (class 2606 OID 30675)
-- Name: produtos_variacoes produtos_variacoes_produto_filho_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_variacoes
    ADD CONSTRAINT produtos_variacoes_produto_filho_id_fkey FOREIGN KEY (produto_filho_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4505 (class 2606 OID 30670)
-- Name: produtos_variacoes produtos_variacoes_produto_pai_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_variacoes
    ADD CONSTRAINT produtos_variacoes_produto_pai_id_fkey FOREIGN KEY (produto_pai_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4506 (class 2606 OID 30665)
-- Name: produtos_variacoes produtos_variacoes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_variacoes
    ADD CONSTRAINT produtos_variacoes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4507 (class 2606 OID 30717)
-- Name: produtos_recompensas recompensas_produto_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_recompensas
    ADD CONSTRAINT recompensas_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES app.produtos(uuid) ON DELETE CASCADE;


--
-- TOC entry 4508 (class 2606 OID 30712)
-- Name: produtos_recompensas recompensas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.produtos_recompensas
    ADD CONSTRAINT recompensas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4448 (class 2606 OID 29918)
-- Name: remetentes_smtp remetentes_smtp_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.remetentes_smtp
    ADD CONSTRAINT remetentes_smtp_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4529 (class 2606 OID 52319)
-- Name: restaurante_metas restaurante_metas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.restaurante_metas
    ADD CONSTRAINT restaurante_metas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4471 (class 2606 OID 30226)
-- Name: tenant_addresses tenant_addresses_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_addresses
    ADD CONSTRAINT tenant_addresses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4472 (class 2606 OID 30244)
-- Name: tenant_contacts tenant_contacts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenant_contacts
    ADD CONSTRAINT tenant_contacts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4431 (class 2606 OID 31505)
-- Name: tenants tenants_pessoa_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.tenants
    ADD CONSTRAINT tenants_pessoa_id_fkey FOREIGN KEY (pessoa_id) REFERENCES app.people(uuid) ON DELETE SET NULL;


--
-- TOC entry 4532 (class 2606 OID 52992)
-- Name: turma_inscritos turma_inscritos_pessoa_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.turma_inscritos
    ADD CONSTRAINT turma_inscritos_pessoa_id_fkey FOREIGN KEY (pessoa_id) REFERENCES app.people(uuid) ON DELETE CASCADE;


--
-- TOC entry 4533 (class 2606 OID 52987)
-- Name: turma_inscritos turma_inscritos_turma_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.turma_inscritos
    ADD CONSTRAINT turma_inscritos_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES app.turmas(uuid) ON DELETE CASCADE;


--
-- TOC entry 4530 (class 2606 OID 52976)
-- Name: turmas turmas_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.turmas
    ADD CONSTRAINT turmas_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES app.people(uuid) ON DELETE SET NULL;


--
-- TOC entry 4531 (class 2606 OID 52971)
-- Name: turmas turmas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.turmas
    ADD CONSTRAINT turmas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


--
-- TOC entry 4432 (class 2606 OID 29677)
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES app.tenants(uuid) ON DELETE CASCADE;


-- Completed on 2026-03-19 14:30:54 -03

--
-- PostgreSQL database dump complete
--

\unrestrict uJsok6XIyg37GipyGgz7b9Fh4v3i7VBP0OZ3Xh9tCyFUBg6wvgaUjwW6v5RpEJB

