"""Runs ONE piece of trail code in a fresh process and prints the result as JSON.

The Python runner starts this file's source with `python -X utf8 -c <source>`, with
the current directory set to the trail's workspace folder, and sends the request
as JSON on stdin: {codigo, entradas, argv, depurar, verificacao}.

It prints a single JSON line: {status, assercao, saida, vars, passos, cortado}.
With "depurar" it also records every line executed (sys.settrace), which powers
the step-by-step debugger in the Python trail.
"""
import builtins, io, json, linecache, sys, traceback

pedido = json.loads(sys.stdin.read())
NOME = '<seu código>'
codigo = pedido['codigo']
linecache.cache[NOME] = (len(codigo), None, codigo.splitlines(True), NOME)

saida = []                     # pedaços [tipo, texto] na ordem em que aparecem
def tamanho():
    return sum(len(t) for _, t in saida)

class Fluxo(io.TextIOBase):
    def __init__(self, tipo): self.tipo = tipo
    def write(self, texto):
        texto = str(texto)
        if saida and saida[-1][0] == self.tipo: saida[-1][1] += texto
        else: saida.append([self.tipo, texto])
        return len(texto)
    def writable(self): return True

fila = list(pedido.get('entradas') or [])
def _input(msg=''):
    sys.stdout.write(str(msg))
    if not fila:
        raise EOFError('o programa pediu uma entrada, mas o campo Entradas está vazio')
    valor = fila.pop(0)
    sys.stdout.write(valor + '\n')
    return valor

def resumo(valor, limite=160):
    try: texto = repr(valor)
    except Exception: texto = '?'
    return texto if len(texto) <= limite else texto[:limite - 3] + '...'

def variaveis(ns):
    return [[k, type(v).__name__, resumo(v)] for k, v in ns.items()
            if not k.startswith('__') and type(v).__name__ != 'module']

passos, MAX_PASSOS, cortado = [], 2000, False
def rastrear(frame, evento, arg):
    global cortado
    if frame.f_code.co_filename != NOME:
        return None
    if evento in ('line', 'return', 'exception') and not cortado:
        if len(passos) >= MAX_PASSOS:
            cortado = True
        else:
            pilha, f = [], frame
            while f is not None and f.f_code.co_filename == NOME:
                pilha.append(f.f_code.co_name); f = f.f_back
            p = {'linha': frame.f_lineno, 'evento': evento,
                 'pilha': list(reversed(pilha)), 'vars': variaveis(frame.f_locals),
                 'saida': tamanho()}
            if evento == 'return': p['retorno'] = resumo(arg)
            if evento == 'exception': p['excecao'] = f'{arg[0].__name__}: {arg[1]}'
            if frame.f_code.co_name != '<module>':
                p['globais'] = variaveis(frame.f_globals)
            passos.append(p)
    return rastrear

ns = {'__name__': '__main__', '__file__': NOME}
sys.argv = ['programa.py'] + list(pedido.get('argv') or [])
builtins.input = _input
sys.stdout, sys.stderr = Fluxo('out'), Fluxo('err')
status, assercao = 'ok', ''
try:
    compilado = compile(codigo, NOME, 'exec')
    if pedido.get('depurar'):
        sys.settrace(rastrear)
    try:
        exec(compilado, ns)
    finally:
        sys.settrace(None)
    if pedido.get('verificacao'):
        exec(compile(pedido['verificacao'], '<verificação>', 'exec'), ns)
except SystemExit as e:
    if e.code not in (0, None): status = 'saida'
except AssertionError as e:
    status, assercao = 'falhou', str(e)
except BaseException:
    status = 'erro'
    tipo, valor, tb = sys.exc_info()
    while tb is not None and tb.tb_frame.f_code.co_filename != NOME:
        tb = tb.tb_next                      # esconde os quadros internos do executor
    saida.append(['tb', ''.join(traceback.format_exception(tipo, valor, tb))])
finally:
    sys.stdout, sys.stderr = sys.__stdout__, sys.__stderr__

print(json.dumps({'status': status, 'assercao': assercao, 'saida': saida,
                  'vars': variaveis(ns), 'passos': passos, 'cortado': cortado}))
