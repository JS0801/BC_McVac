/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], function () {

    function saveRecord(context) {
        try {
            var hasFile = false;

            // find all cells that match this kind of file/folder column
            var cells = document.querySelectorAll('td[data-ns-tooltip="Folder"] div.listinlinefocusedrowcellnoedit');
            log.debug('cells', cells)
            var i = 0;
            var cellText = '';

            for (i = 0; i < cells.length; i++) {
                cellText = cells[i].innerHTML || '';

                // remove nbsp and spaces
                cellText = cellText.replace(/&nbsp;/g, '').replace(/\s/g, '');

                if (cellText !== '') {
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