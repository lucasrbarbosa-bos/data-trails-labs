import sys
import traceback
import builtins
from browser import window


class OutputStream:
    def __init__(self, stream_type):
        self.stream_type = stream_type

    def write(self, text):
        window.pyEmit(self.stream_type, str(text))
        return len(str(text))

    def flush(self):
        pass


def execute(source_code, extra, input_lines, argv):
    ns = {'__name__': '__main__'}
    pending_inputs = [str(x) for x in input_lines]

    def _input(msg=''):
        sys.stdout.write(str(msg))
        if pending_inputs:
            value = pending_inputs.pop(0)
        else:
            value = window.prompt(str(msg) or str(window.pyInputLabel))
            value = '' if value is None else str(value)
        sys.stdout.write(value + '\n')
        return value

    original_streams = (sys.stdout, sys.stderr, builtins.input, sys.argv)
    sys.stdout, sys.stderr = OutputStream('out'), OutputStream('err')
    builtins.input = _input
    sys.argv = ['programa.py'] + [str(a) for a in argv]
    status = 'ok'
    try:
        exec(compile(source_code, '<seu código>', 'exec'), ns)
        if extra:
            exec(compile(extra, '<verificação>', 'exec'), ns)
    except SystemExit as e:
        if e.code not in (0, None):
            status = 'saida'
    except AssertionError as e:
        status = 'falhou'
        window.pyEmit('assert', str(e) if str(e) else '')
    except BaseException:
        status = 'erro'
        window.pyEmit('tb', traceback.format_exc())
    finally:
        sys.stdout, sys.stderr, builtins.input, sys.argv = original_streams
    variables = []
    for name, value in list(ns.items()):
        if name.startswith('__') or type(value).__name__ == 'module':
            continue
        try:
            text = repr(value)
        except Exception:
            text = '?'
        if len(text) > 160:
            text = text[:157] + '...'
        variables.append([name, type(value).__name__, text])
    window.pyVars(variables)
    return status


window.pyExecute = execute
window.pyReady()
