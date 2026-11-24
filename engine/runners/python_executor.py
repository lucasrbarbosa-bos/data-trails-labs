"""Runs ONE piece of trail code in a fresh process and prints the result as JSON.

The Python runner starts this file's source with `python -X utf8 -c <source>`, with
the current directory set to the trail's workspace folder, and sends the request
as JSON on stdin: {code, inputs, argv, debug, check}.

It prints a single JSON line: {status, assertion, output, vars, steps, truncated}.
With "debug" it also records every line executed (sys.settrace), which powers
the step-by-step debugger in the Python trail.
"""
import builtins, io, json, linecache, sys, traceback

request = json.loads(sys.stdin.read())
FILENAME = '<your code>'           # shown in tracebacks; the trail page links its line numbers
code = request['code']
linecache.cache[FILENAME] = (len(code), None, code.splitlines(True), FILENAME)

output = []                    # [stream, text] chunks, in the order they were written
def output_size():
    return sum(len(t) for _, t in output)

class Stream(io.TextIOBase):
    def __init__(self, kind): self.kind = kind
    def write(self, text):
        text = str(text)
        if output and output[-1][0] == self.kind: output[-1][1] += text
        else: output.append([self.kind, text])
        return len(text)
    def writable(self): return True

pending_inputs = list(request.get('inputs') or [])
def _input(prompt=''):
    sys.stdout.write(str(prompt))
    if not pending_inputs:
        raise EOFError('the program asked for input, but the Inputs field is empty')
    value = pending_inputs.pop(0)
    sys.stdout.write(value + '\n')
    return value

def summary(value, limit=160):
    try: text = repr(value)
    except Exception: text = '?'
    return text if len(text) <= limit else text[:limit - 3] + '...'

def variables(ns):
    return [[k, type(v).__name__, summary(v)] for k, v in ns.items()
            if not k.startswith('__') and type(v).__name__ != 'module']

steps, MAX_STEPS, truncated = [], 2000, False
def trace(frame, event, arg):
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
            step = {'line': frame.f_lineno, 'event': event,
                    'stack': list(reversed(stack)), 'vars': variables(frame.f_locals),
                    'output': output_size()}
            if event == 'return': step['returned'] = summary(arg)
            if event == 'exception': step['exception'] = f'{arg[0].__name__}: {arg[1]}'
            if frame.f_code.co_name != '<module>':
                step['globals'] = variables(frame.f_globals)
            steps.append(step)
    return trace

ns = {'__name__': '__main__', '__file__': FILENAME}
sys.argv = ['program.py'] + list(request.get('argv') or [])
builtins.input = _input
sys.stdout, sys.stderr = Stream('out'), Stream('err')
status, assertion = 'ok', ''
try:
    compiled = compile(code, FILENAME, 'exec')
    if request.get('debug'):
        sys.settrace(trace)
    try:
        exec(compiled, ns)
    finally:
        sys.settrace(None)
    if request.get('check'):
        exec(compile(request['check'], '<check>', 'exec'), ns)
except SystemExit as e:
    if e.code not in (0, None): status = 'exit'
except AssertionError as e:
    status, assertion = 'failed', str(e)
except BaseException:
    status = 'error'
    kind, value, tb = sys.exc_info()
    while tb is not None and tb.tb_frame.f_code.co_filename != FILENAME:
        tb = tb.tb_next                      # hide the executor's own frames
    output.append(['tb', ''.join(traceback.format_exception(kind, value, tb))])
finally:
    sys.stdout, sys.stderr = sys.__stdout__, sys.__stderr__

print(json.dumps({'status': status, 'assertion': assertion, 'output': output,
                  'vars': variables(ns), 'steps': steps, 'truncated': truncated}))
