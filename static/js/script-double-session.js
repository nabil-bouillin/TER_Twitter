$(document).ready(function () {
    $.ajax({
        url: '/load_double_sessions/' + $('#session_target').attr('data-session'),
        data: '',
        type: 'GET',

        success: function (response) {console.log('OK');},
        error: function (error) {/**/}
    });

    setTimeout(function(){
        refresh_geo(1);
        refresh_tweet_polarity(false,1);
    }, 1000);
    setTimeout(function () {
        $.ajax({
            url: '/load_double_sessions/' + $('#session_target2').attr('data-session'),
            data: '',
            type: 'GET',

            success: function (response) {console.log('OK');},
            error: function (error) {/**/}
        });
    },1000);

    setTimeout(function(){
        refresh_geo(2);
        refresh_tweet_polarity(false,2);
    }, 1500);

});
