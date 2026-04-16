/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], function () {

    function saveRecord(context) {
        try {
            var table = document.getElementById('mediaitem_splits');
            var rows, i, rowId, hasFile = false;

            if (!table) {
                alert('Attached Files table not found on the page.');
                return false;
            }

            rows = table.getElementsByTagName('tr');

            for (i = 0; i < rows.length; i++) {
                rowId = rows[i].id || '';

                if (rowId.indexOf('mediaitemrow') === 0) {
                    hasFile = true;
                    break;
                }
            }

            if (!hasFile) {
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