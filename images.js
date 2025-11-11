class image {
    constructor(){
        this.effectList = new Array;
        this.srcImageData = new Array;
        this.processedImageData = new Array;
    }

    setImageData(){

    }

    updateImage(){

        if(!this.srcImageData===undefined){
            this.processedImageData = this.srcImageData;
            this.effectList.forEach(ef => {
                this.processedImageData = ef.applyTo(this.processedImageData);
            })
        }
    }

    addEffect(newEffect){
        this.effectList.push(newEffect);
        updateImage();
    }
}