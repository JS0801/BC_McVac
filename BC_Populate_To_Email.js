/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/ui/serverWidget'], function(search, serverWidget) {

    function beforeLoad(context) {
        if (context.type !== context.UserEventType.CREATE) return;

        var rec = context.newRecord;
        var form = context.form;
        var transactionId = rec.getValue({ fieldId: 'transaction' });
        if (!transactionId) return;

        var result = search.create({
            type: 'invoice',
            filters: [
                ['type', 'anyof', 'CustInvc'],
                'AND',
                ['internalid', 'anyof', transactionId],
                'AND',
                ['mainline', 'is', 'T'],
                'AND',
                ['customermain.custentity_bc_contact_emails', 'isnotempty', '']
            ],
            columns: [
                search.createColumn({
                    name: 'custentity_bc_contact_emails',
                    join: 'customerMain'
                })
            ]
        }).run().getRange({
            start: 0,
            end: 1
        });

        if (!result || !result.length) return;

        var emailString = result[0].getValue({
            name: 'custentity_bc_contact_emails',
            join: 'customerMain'
        });

        if (!emailString) return;

        var rawArr = emailString.split(';');
        var cleanArr = [];
        var seen = {};
        var i = 0;
        var email = '';

        for (i = 0; i < rawArr.length; i++) {
            email = (rawArr[i] || '').replace(/^\s+|\s+$/g, '');
            if (email && !seen[email.toLowerCase()]) {
                seen[email.toLowerCase()] = true;
                cleanArr.push(email);
            }
        }

        if (!cleanArr.length) return;

        var htmlField = form.addField({
            id: 'custpage_email_dom_loader',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Email DOM Loader'
        });

        htmlField.defaultValue =
            '<script>' +
            '(function(){' +
            'var EMAILS = ' + JSON.stringify(cleanArr) + ';' +

            'function setVal(el, val){' +
            '  if (!el) return;' +
            '  el.value = val;' +
            '  try { el.setAttribute("value", val); } catch(e){}' +
            '  if (typeof el.onchange === "function") {' +
            '    try { el.onchange(); } catch(e){}' +
            '  }' +
            '  try {' +
            '    var evt = document.createEvent("HTMLEvents");' +
            '    evt.initEvent("change", true, false);' +
            '    el.dispatchEvent(evt);' +
            '  } catch(e){}' +
            '}' +

            'function clickEl(el){' +
            '  if (!el) return false;' +
            '  try { el.click(); return true; } catch(e) {}' +
            '  try { el.dispatchEvent(new MouseEvent("click", {bubbles:true})); return true; } catch(e) {}' +
            '  return false;' +
            '}' +

            'function addOne(email, done){' +
            '  var input = document.getElementById("mediaitem_mediaitem_display");' +
            '  var recipientInput = document.getElementById("otherrecipientslist_email_display") || document.querySelector(\'input[name="email_display"]\') || document.querySelector(\'#otherrecipientslist_splits input[type="text"]\');' +
            '  var toChk = document.getElementById("otherrecipientslist_toRecipients_fs_inp") || document.querySelector(\'input[name="toRecipients"]\');' +
            '  var addBtn = document.getElementById("otherrecipientslist_addedit") || document.querySelector(\'button[id="otherrecipientslist_addedit"]\') || document.querySelector(\'#tbl_otherrecipientslist_addedit button\');' +

            '  if (!recipientInput || !toChk || !addBtn) {' +
            '    done(false);' +
            '    return;' +
            '  }' +

            '  setVal(recipientInput, email);' +
            '  if (!toChk.checked) clickEl(toChk);' +

            '  setTimeout(function(){' +
            '    clickEl(addBtn);' +
            '    setTimeout(function(){ done(true); }, 500);' +
            '  }, 300);' +
            '}' +

            'function getExistingEmails(){' +
            '  var map = {};' +
            '  var rows = document.querySelectorAll(\'#otherrecipientslist_splits tr[id^="otherrecipientslist_row_"], #otherrecipientslist_splits tr[id^="otherrecipientslistrow"]\');' +
            '  for (var i = 0; i < rows.length; i++) {' +
            '    var txt = rows[i].innerText || rows[i].textContent || "";' +
            '    var m = txt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/ig);' +
            '    if (m) {' +
            '      for (var j = 0; j < m.length; j++) map[m[j].toLowerCase()] = true;' +
            '    }' +
            '  }' +
            '  return map;' +
            '}' +

            'function processEmails(idx){' +
            '  if (idx >= EMAILS.length) return;' +
            '  var existing = getExistingEmails();' +
            '  var email = EMAILS[idx];' +
            '  if (existing[email.toLowerCase()]) {' +
            '    processEmails(idx + 1);' +
            '    return;' +
            '  }' +
            '  addOne(email, function(){' +
            '    processEmails(idx + 1);' +
            '  });' +
            '}' +

            'function start(){' +
            '  processEmails(0);' +
            '}' +

            'setTimeout(start, 1200);' +
            '})();' +
            '</script>';
    }

    return {
        beforeLoad: beforeLoad
    };
});