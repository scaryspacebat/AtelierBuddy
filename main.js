let imageList = new Array;

function initPage(){
    showNotification("Hello");
    initBackground();
}

function addImage(){
    var openFile = function(file) {
    var input = file.target;
    var reader = new FileReader();
    reader.onload = function(){
        var dataURL = reader.result;
        var output = document.getElementById('srcImageDisplay');
        output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
    };

    var newImage = new image();
    newImage.addEffect(new effectBlackWhite());
    imageList.push(newImage);
}

function showNotification(notificationText){
    document.querySelector("#notification").style.visibility="visible";
    document.querySelector("#notification").innerHTML=notificationText;
    setTimeout(hideNotification, 3000);
}

function hideNotification(){
    document.querySelector("#notification").style.visibility="hidden";
}

function showAddImageDialog(){
    document.querySelector("#addImageDialog").style.visibility="visible";
}

function hideAddImageDialog(){
    document.querySelector("#addImageDialog").style.visibility="hidden";
}