$(document).ready(function () {
    refresh_geo();
    refresh_tweet_polarity(false);
    refresh_sunburst(false);
    refresh_histogram(true);
    refresh_wordcloud(false);
    refresh_tweet_frequency_words(false);

    /* Si l'on démarre un stream */
    $(document).on("click", '#start-stream_button', function () {
        $(this).prop("disabled", true);
        $('#stop-stream_button').prop("disabled", false);
        load_containers();
        $('#general_wc_scroll').removeClass("disabled");
        $('#histogram_scroll').removeClass("disabled");
        $('#polarity_scroll').removeClass("disabled");
        $('#location_scroll').removeClass("disabled");
        $('#bar_chart_scroll').removeClass("disabled");
        $('#sunburst_scroll').removeClass("disabled");

        $.ajax({
            url: '/session/' + $(this).attr('action-target'),
            data: $('form').serialize(),
            type: 'POST',
            success: function (response) {/**/},
            error: function (error) {/**/}
        });
    });

    /* Si l'on stop le stream */
    $(document).on("click", '#stop-stream_button', function () {
        $(this).attr("disabled", "disabled");
        $('#start-stream_button').prop("disabled", false);
        refresh_number_tweets();
        $.ajax({
            url: '/session/stream/stop',
            data: '',
            type: 'GET',
            success: function (response) {
                refresh_geo();
                refresh_tweet_polarity(false);
                refresh_sunburst(false);
                refresh_wordcloud(true);
                refresh_tweet_frequency_words(false);
                first_refresh = false;
            },
            error: function (error) {/**/}
        });
    });

    /*Si l'on démarre un batch de tweets passés*/
    $(document).on("click", '#start-dated_tweets_button', function () {
        var button_target = $(this);
        button_target.attr("disabled", "disabled");
        button_target.removeClass("pulse");
        load_containers();
        $('#loading_circle').show();
        $('#general_wc_scroll').removeClass("disabled");
        $('#histogram_scroll').removeClass("disabled");
        $('#location_scroll').removeClass("disabled");
        $('#polarity_scroll').removeClass("disabled");
        $('#bar_chart_scroll').removeClass("disabled");
        $('#sunburst_scroll').removeClass("disabled");

        $.ajax({
            url: '/session/' + button_target.attr('action-target'),
            data: '',
            type: 'POST',

            success: function (response) {
                refresh_number_tweets();
                refresh_geo();
                refresh_tweet_polarity(false);
                refresh_sunburst(false);
                refresh_histogram(false);
                refresh_wordcloud(false);
                refresh_tweet_frequency_words(false);
                $('.progress').hide();
                $('#barre_progression').width("0%");
                button_target.prop("disabled", false);
                button_target.addClass("pulse");
            },
            error: function (error) {/**/}
        });
    });

    var first_refresh = false;

    window.setInterval(function () {
        var stream_button_pressed = $('#start-stream_button').is(":disabled");
        var datedtweets_button_pressed = $('#start-dated_tweets_button').is(":disabled");
        if (stream_button_pressed || datedtweets_button_pressed) {
            refresh_number_tweets();
            refresh_download_btn();
            refresh_tweet_polarity(true);
            refresh_sunburst(true);
            refresh_tweet_frequency_words(true);
            if (!first_refresh) {
                first_refresh = true;
                refresh_geo();
                //refresh_tweet_polarity(true);
                refresh_sunburst(true);
                refresh_wordcloud(false);
                refresh_tweet_frequency_words(true);
            }

            ajax_freq_per_date(function repeat() {
                if (datedtweets_button_pressed) {
                    $('#histogram').load(' #histogram', function () {
                        ajax_freq_per_date(repeat, null);
                    });
                }
            }, null);

            if(datedtweets_button_pressed){
                var nb_tweets = $('#div_number_of_tweets').text();
                var batch = $('#start-dated_tweets_button').attr('data-batch');
                $('#barre_progression').width((((nb_tweets % batch) / batch)* 100) + "%");
            }
        }
    }, 1000);

    /* A l'appui d'un intervalle pour l'histogramme */
    $('input[type=radio][name=time_interval]').change(function () {
        refresh_histogram(false, this.value);
        refresh_lw_tw();
    });


});

