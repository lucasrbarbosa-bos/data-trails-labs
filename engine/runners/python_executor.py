"""Runs ONE piece of course code in a fresh process and prints the result as JSON.

The Python runner starts this file's source with `python -X utf8 -c <source>`, with
the current directory set to the course's workspace folder, and sends the request
as JSON on stdin: {codigo, entradas, argv, depurar, verificacao}.

It prints a single JSON line: {status, assercao, saida, vars, passos, cortado}.
With "depurar" it also records every line executed (sys.settrace), which powers
the step-by-step debugger in the Python course.
"""
import builtins, io, json, linecache, sys, traceback

request = json.loads(sys.stdin.read())
FILENAME = '<seu código>'
source_code = request['codigo']
linecache.cache[FILENAME] = (len(source_code), None, source_code.splitlines(True), FILENAME)

output = []                     # [stream type, text] chunks in emission order
def output_size():
    return sum(len(t) for _, t in output)

class OutputStream(io.TextIOBase):
    def __init__(self, stream_type): self.stream_type = stream_type
    def write(self, text):
        text = str(text)
        if output and output[-1][0] == self.stream_type: output[-1][1] += text
        else: output.append([self.stream_type, text])
        return len(text)
    def writable(self): return True

pending_inputs = list(request.get('entradas') or [])
def _input(msg=''):
    sys.stdout.write(str(msg))
    if not pending_inputs:
        raise EOFError('o programa pediu uma entrada, mas o campo Entradas está vazio')
    value = pending_inputs.pop(0)
    sys.stdout.write(value + '\n')
    return value

def summarize(value, limit=160):
    try: text = repr(value)
    except Exception: text = '?'
    return text if len(text) <= limit else text[:limit - 3] + '...'

def variables(ns):
    return [[k, type(v).__name__, summarize(v)] for k, v in ns.items()
            if not k.startswith('__') and type(v).__name__ != 'module']

steps, MAX_STEPS, truncated = [], 2000, False
def trace_execution(frame, event, arg):
    global truncated
    if frame.f_code.co_filename != FILENAME:
        return None
    if event in ('line', 'return', 'exception') and not truncated:
        if len(steps) >= MAX_STEPS:
            truncated = True
        else:
            stack, f = [], frame
            while f is not None and f.f_code.co_filename == FILENAME:
                stack.append(f.f_code.co_name); f = f.f_back
            p = {'linha': frame.f_lineno, 'evento': event,
                 'pilha': list(reversed(stack)), 'vars': variables(frame.f_locals),
                 'saida': output_size()}
            if event == 'return': p['retorno'] = summarize(arg)
            if event == 'exception': p['excecao'] = f'{arg[0].__name__}: {arg[1]}'
            if frame.f_code.co_name != '<module>':
                p['globais'] = variables(frame.f_globals)
            steps.append(p)
    return trace_execution

ns = {'__name__': '__main__', '__file__': FILENAME}
sys.argv = ['programa.py'] + list(request.get('argv') or [])
builtins.input = _input
sys.stdout, sys.stderr = OutputStream('out'), OutputStream('err')
status, assertion_error = 'ok', ''
try:
    compiled = compile(source_code, FILENAME, 'exec')
    if request.get('depurar'):
        sys.settrace(trace_execution)
    try:
        exec(compiled, ns)
    finally:
        sys.settrace(None)
    if request.get('verificacao'):
        exec(compile(request['verificacao'], '<verificação>', 'exec'), ns)
except SystemExit as e:
    if e.code not in (0, None): status = 'saida'
except AssertionError as e:
    status, assertion_error = 'falhou', str(e)
except BaseException:
    status = 'erro'
    error_type, value, tb = sys.exc_info()
    while tb is not None and tb.tb_frame.f_code.co_filename != FILENAME:
        tb = tb.tb_next                      # Hide internal executor frames
    output.append(['tb', ''.join(traceback.format_exception(error_type, value, tb))])
finally:
    sys.stdout, sys.stderr = sys.__stdout__, sys.__stderr__

print(json.dumps({'status': status, 'assercao': assertion_error, 'saida': output,
                  'vars': variables(ns), 'passos': steps, 'cortado': truncated}))
