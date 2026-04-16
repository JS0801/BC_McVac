/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], function () {

    function saveRecord(context) {
        try {
            var rec = context.currentRecord;
            log.debug('rec', rec)


            var sublists = rec.getSublists() || [];
            log.debug('Sublists',sublists);

            // Standard Files subtab on transaction
            var sublistId = 'mediaitem';
            var lineCount = 0;
            var hasFile = false;
            var i, fileId;

            try {
                lineCount = rec.getLineCount({
                    sublistId: sublistId
                }) || 0;
            } catch (e) {
                alert('Unable to validate attached files. Please contact admin.');
                return false;
            }

            for (i = 0; i < lineCount; i++) {
                fileId = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'mediaitem',
                    line: i
                });

                if (fileId) {
                    hasFile = true;
                    break;
                }
            }

            if (!hasFile) {
                alert('Please attach file before saving this Invoice.');
                return true;
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