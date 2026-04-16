/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], function () {

    function saveRecord(context) {
        try {
            var table = document.getElementById('mediaitem_splits');
            var attachedRows = [];
            
            if (table) {
                attachedRows = table.querySelectorAll('tr[id^="mediaitem_row_"], tr[id^="mediaitemrow"]');
            }

            if (!attachedRows || attachedRows.length === 0) {
                alert('Please attach at least one file before saving this Invoice.');
                return false;
            }

            return true;

        } catch (e) {
            alert('Error while validating attached files: ' + e.message);
            return false;
        }
    }

    return {
        saveRecord: saveRecord
    };
});