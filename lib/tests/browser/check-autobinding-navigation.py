"""Real Bubble navigation checks; mutates only the disposable WTF-260 records.
Requires agent-browser session wtf260 on the documented feature-branch fixture.
"""
import json, subprocess, time
BASE = ['agent-browser', '--session', 'wtf260', '--json']
def browser(*args):
    r = subprocess.run(BASE + list(args), capture_output=True, text=True)
    result = json.loads(r.stdout)
    if not result['success']: raise RuntimeError(result.get('error'))
    return result['data']
def evaluate(js): return browser('eval', js).get('result')
def click(name): browser('find', 'role', 'button', 'click', '--name', name, '--exact')
def state():
    return evaluate('(()=>{const i=document.querySelector("#wtf260-editor").bubble_data.bubble_instance,d=i._plugin_data;return {id:d._boundRecordId,html:d.editor.getHTML(),pending:!!d._pendingContent,auto:i.get_static_property("auto_binding"),uploads:i.get_static_property("file_upload_condition")}})()')
url = evaluate('location.href')
assert '/version-33jpy/wtf-260-autobinding' in url, url
click('Show editor'); click('Delay 300'); click('Record B'); time.sleep(.5)
b = state()
assert b['id'] == '1789047009959x299667751052360450'
click('Record A'); time.sleep(.5)
click('Switch to B in 1 second')
started = time.monotonic()
browser('click', '.ProseMirror'); browser('press', 'End')
time.sleep(max(0, .72 - (time.monotonic() - started)))
browser('keyboard', 'type', ' PENDING-A-NAV')
pending = state()
assert pending['pending'] and pending['id'] == '1789047006074x991054080173902500', pending
time.sleep(1)
after = state()
assert after['id'] == b['id'] and after['html'] == b['html'], after
click('Record A'); click('Hide editor'); click('Record B'); click('Show editor'); time.sleep(.5)
assert state()['html'] == b['html']
browser('reload'); time.sleep(2)
click('Record B'); time.sleep(.5)
assert state()['html'] == b['html']
# A real edit in B must also survive a complete page/editor recreation.
browser('click', '.ProseMirror'); browser('press', 'End'); browser('keyboard', 'type', ' SAVED-B-NAV')
time.sleep(.8)
saved_b = state()['html']
browser('reload'); time.sleep(2); click('Record B'); time.sleep(.5)
assert state()['html'] == saved_b
assert state()['auto'] is True and state()['uploads'] is False
print(json.dumps({'url':url,'pendingBeforeSwitch':True,'recordBUnchangedByA':True,'hideSwitchShow':True,'recreatedEditor':True,'recordBEditPersisted':True},indent=2))
