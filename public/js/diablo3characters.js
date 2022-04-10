
$(document).ready(() => {

    $('#diablo3CharsBackButton').click(() => {
        window.location.href = '/diablo';
    });

    $('#diablo3itemsBackButton').click(() => {
/*         var path = window.location.pathname;
        if (path.includes('items') && path.includes('character')) {
            path = path.split('/character/');
            if (path[1].includes('/items')) {
                path = path[1].split('/items');
                //console.log(path[0]);
                window.location.href=`/api/diablo/character/${path[0]}`;
            }
        } */

        window.location.href=`/diablo/`;
    });

    $('#bnetSubmit').click(() => {
        window.location.href=`/diablo/getInfo/` + encodeURIComponent($('#bnetIDInput').val());
    });

    $('#diablo3itemsBackButton').click(() => {
        window.location.href=`/diablo/getInfo/` + encodeURIComponent($('#bnetID').val());
    });

    $('#mainMenuButton').click(() => {
        window.location.href=`/`;
    });
});