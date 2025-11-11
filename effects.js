class effect {
    applyTo(imageData){

    }
}

class effectBlackWhite extends effect {
    constructor(){
        super();
        this.redWeight = 0.333;
        this.greenWeight = 0.333;
        this.blueWeight = 0.333;
    }

    setColorWeights(red, green, blue){
        this.redWeight = red;
        this.greenWeight = green;
        this.blueWeight = blue;
    }

    applyTo(imageData){
        var output = new Array[imageData.length];

        for(var i = 0; i<imageData.length; i++){
            output[i] = new Array[imageData[i].length];
            for(var j = 0; j<imageData[i].length; j++){
                var bwVal = this.redWeight*imageData[i][j][0] + this.greenWeight*imageData[i][j][1] + this.blueWeight*imageData[i][j][2];
                output[i][j] =  [bwVal, bwVal, bwVal];
            }
        }

        return output;
    }
}