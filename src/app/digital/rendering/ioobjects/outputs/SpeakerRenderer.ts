import {blend, parseColor} from "svg2canvas";
import {V} from "Vector";
import {Camera} from "math/Camera";
import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";
import {Images} from "digital/utils/Images";


import {DigitalSpeaker} from "digital/models/ioobjects";


export const DigitalSpeakerRenderer = (() => {
   return{
        render(renderer: Renderer, _: Camera, speaker: DigitalSpeaker, selected: boolean): void {

        if(!speaker.isOn()){           

        const size = speaker.getSize().scale(3);
        console.log("HI",size);
        renderer.image(Images.GetImage(speaker.getImageName()), V(), size);

        }
        else{
            //Render the sound 
            const audioCtx = new AudioContext(); // need try catch block some browsers dont support this
            const audio = new Audio("");
            const source = audioCtx.createMediaElementSource(audio);
            source.connect(audioCtx.destination);
            audio.play();

            //Render the speaker
            console.log("HDSI",speaker.getSize());




        }
    }
   }

})();