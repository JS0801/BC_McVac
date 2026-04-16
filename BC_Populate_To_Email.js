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
            '  try { el.setAttribute("value", val); } catch(e) {}' +
            '  try {' +
            '    var evt = document.createEvent("HTMLEvents");' +
            '    evt.initEvent("change", true, false);' +
            '    el.dispatchEvent(evt);' +
            '  } catch(e) {}' +
            '  try { if (typeof el.onchange === "function") el.onchange(); } catch(e) {}' +
            '}' +

            'function clickEl(el){' +
            '  if (!el) return;' +
            '  try { el.click(); } catch(e) {}' +
            '}' +

            'function getRecipientInput(){' +
            '  return document.querySelector(\'#otherrecipientslist_splits input[type="text"]\') ||' +
            '         document.querySelector(\'td[data-ns-tooltip="Email"] input[type="text"]\') ||' +
            '         document.querySelector(\'input[id*="otherrecipientslist"][type="text"]\');' +
            '}' +

            'function getToCheckbox(){' +
            '  return document.getElementById("otherrecipientslist_toRecipients_fs_inp") ||' +
            '         document.querySelector(\'input[name="toRecipients"]\');' +
            '}' +

            'function getAddButton(){' +
            '  return document.getElementById("otherrecipientslist_addedit") ||' +
            '         document.querySelector(\'button[id*="otherrecipientslist_addedit"]\');' +
            '}' +

            'function getExistingEmails(){' +
            '  var map = {};' +
            '  var rows = document.querySelectorAll(\'#otherrecipientslist_splits tr\');' +
            '  for (var i = 0; i < rows.length; i++) {' +
            '    var txt = rows[i].innerText || rows[i].textContent || "";' +
            '    var matches = txt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/ig);' +
            '    if (matches) {' +
            '      for (var j = 0; j < matches.length; j++) {' +
            '        map[matches[j].toLowerCase()] = true;' +
            '      }' +
            '    }' +
            '  }' +
            '  return map;' +
            '}' +

            'function addEmail(email, callback){' +
            '  var input = getRecipientInput();' +
            '  var toChk = getToCheckbox();' +
            '  var addBtn = getAddButton();' +

            '  if (!input || !toChk || !addBtn) {' +
            '    callback();' +
            '    return;' +
            '  }' +

            '  setVal(input, email);' +
            '  if (!toChk.checked) clickEl(toChk);' +

            '  setTimeout(function(){' +
            '    clickEl(addBtn);' +
            '    setTimeout(function(){ callback(); }, 500);' +
            '  }, 300);' +
            '}' +

            'function processEmails(index){' +
            '  if (index >= EMAILS.length) return;' +
            '  var existing = getExistingEmails();' +
            '  var email = EMAILS[index];' +
            '  if (existing[email.toLowerCase()]) {' +
            '    processEmails(index + 1);' +
            '    return;' +
            '  }' +
            '  addEmail(email, function(){ processEmails(index + 1); });' +
            '}' +

            'setTimeout(function(){ processEmails(0); }, 1200);' +
            '})();' +
            '</script>';
    }

    return {
        beforeLoad: beforeLoad
    };
});