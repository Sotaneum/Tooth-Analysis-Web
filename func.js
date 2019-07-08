var sel_demo = 0;

function getNormalTeethScore(data){
    return data['annotation_result'].length;
}

function getBadTeethScore(data){
    var Bad_teeth = 0;
    for (chk_idx in data['annotation_result']){
        obj = data['annotation_result'][chk_idx];
        if(obj['object_type'] != "teeth"){
            Bad_teeth++;
        }
    }
    return Bad_teeth;
}

function resultData(ori_data,ext_data){
    var search_teeth = getNormalTeethScore(ori_data);
    var bad_teeth = getBadTeethScore(ext_data);
    var god_teeth = search_teeth-bad_teeth;
    if(god_teeth>0 && search_teeth!=0){
        var result = 101 - (god_teeth/search_teeth * 100);
    }
    if(result<=50){
        var bad_count = bad_teeth*25;
        if(bad_count+result>100){
            result=100;
        }else{
            result+=bad_count;
        }
    }
    var image = ext_data;
    var result_image_path = image['image_path'];
    $(".div_body_result_img canvas").css("background-image", "url('./detect/"+result_image_path+"?model=teeth_ext')");
    $('.div_body_result_info_title_result').text(parseInt(result));
    $('.div_body_upload_btn_form_input').prop("value","");
    $('.div_body_loading').fadeOut();
    $('.div_body_result').fadeIn();
    sel_demo=0;
}

function getExtData(data){
    var data = jQuery.parseJSON(data);
    var image = data[0];
    var ori_file_name = image['ori_file_name'];
    $.ajax({
        type: "GET",
        url: "./detect.do?xy=true&model_name=teeth_ext&image="+ori_file_name,
        contentType: false,
        processData: false,
        success: function(msg) {
            resultData(data[0], jQuery.parseJSON(msg)[0]);
        },
        error: function() {
            error();
        }
    });   
}

function reset(){
    $('.div_body_loading').fadeIn();
    $('.div_body_upload').fadeOut();
    $('.div_body_result').fadeOut();
}

function error(){
    $('.div_body_upload_btn_form_input').prop("value","");
    $('.div_body_loading').fadeOut();
    $('.div_body_result').fadeOut();
    $('.div_body_upload').fadeIn();
    alert( "서버와 연결할 수 없습니다." );
}

$(document).ready(function() { 
    $.get( "./getUsingInfo.air", function(data) {
        $('.div_body_upload_info_cnt').text(data);
    })
    .done(function() {
        $('.div_body_loading').fadeOut();
        $('.div_body_upload').fadeIn();
    })
    .fail(function() {
        alert( "서버와 연결할 수 없습니다." );
    });
    $('.div_body_upload_btn_form_input').on('change', function(){
        var formData = new FormData($('.div_body_upload_btn_form')[0]);
        formData.append('fileObj', $('.div_body_upload_btn_form_input')[0].files[0]);
        $.ajax({
            type: "POST",
            url: "./detect.do?xy=true",
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: function() {
                reset();
                sel_demo=4;
            },
            success: function(msg) {
                getExtData(msg);
            },
            error: function() {
                error();
            }
        });
    });
    $('.div_body_result_info_context_btn').on('click', function(){
        location.reload();
    });
    $('.div_demo_imglist_img').on('click', function(){
        var num = this.getAttribute("value");
        if(sel_demo!=0){
            return;
        }
        sel_demo=num;
        $.ajax({
            type: "GET",
            url: "./detect.do?xy=true&image=demo0"+num+".jpg",
            contentType: false,
            processData: false,
            beforeSend: function() {
                reset();
            },
            success: function(msg) {
                getExtData(msg);
            },
            error: function() {
                error();
            }
        });
    });
});