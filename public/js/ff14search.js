
$(document).ready(() => {

    $('#ff14CharBackButton').click(() => {
        window.location.href = '/ff14';
    });

    $('#ff14Submit').click(() => {
        if ($('#ff14Search').val()) {
            $('#ff14Submit').html(
                '<i class="fa fa-circle-o-notch fa-spin"></i> loading...'
                );
            window.location.href=`/ff14/search/` + encodeURIComponent($('#ff14Search').val());
        } else {
            $('#ff14Search').focus();
        }
    });

    $('#mainMenuButton').click(() => {
        window.location.href=`/`;
    });

});