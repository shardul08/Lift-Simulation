const UP_BUTTON = `<i class="fa-solid fa-arrow-up"></i>`;
const UP_BUTTON_ANIMATED = `<i class="fa-solid fa-arrow-up fa-beat" style="color: #bbdf07;"></i>`;
const DOWN_BUTTON = `<i class="fa-solid fa-arrow-down"></i>`;
const DOWN_BUTTON_ANIMATED = `<i class="fa-solid fa-arrow-down fa-beat" style="color: #bbdf07;"></i>`;
const MUTE_BUTTON =  `<i class="fa-solid fa-volume-high"></i>`;
const UNMUTE_BUTTON = `<i class="fa-solid fa-volume-xmark"></i>`;
const BACK_BUTTON = `<i class="fa-solid fa-arrow-left"></i>`;



window.onload = function() {
    var form = document.getElementById("myForm");
    form.addEventListener('submit', handleSubmit);

    let FLOORS = [];
    let LIFTS = [];
    let muted = false;
    let QUEUE = [];


    function handleSubmit(event) {
        console.log("hello");
        console.log(screen.availWidth)
        event.preventDefault();
        FLOORS = [];
        LIFTS = [];

        let num_floor = document.getElementById("num-floor").value;
        let num_lift = document.getElementById("num-lift").value;
        console.log(num_floor, num_lift);

        if(!validateInput(num_floor, num_lift)) {
            return;
        }

        createFloors(num_floor);
        createLifts(num_lift);

        renderFloors();
        renderLifts();

        muted = ~muted;
        muteEvent();
        
    }

    function validateInput(num_floor, num_lift) {
        let validated = true;
        if(num_floor < 2 || num_floor > 100) {
            alert("Max floors allowed: 100");
            validated = false;
        }
        if(num_lift < 1 || num_lift > (screen.availWidth/90 - 1)) {
            alert("Max lifts allowed: " + Math.floor(screen.availWidth/90 - 1));
            validated = false;
        }

        return validated;
    }

    function createFloors(num_floor) {
        console.log("creating floors...", num_floor);
        
        for(let i=0; i<=num_floor; i++) {
            let floor = document.createElement("div");
            floor.setAttribute("class", "floor");

            if(i != num_floor) {
                let upButton = document.createElement("button");
                upButton.innerHTML = UP_BUTTON;
                upButton.setAttribute("name", `UP_${i}`)
                upButton.setAttribute("class", "lift-btn");
                upButton.onclick = buttonEvent;
                floor.appendChild(upButton);
            }
            
            if(i != 0) {
                let downButton = document.createElement("button");
                downButton.innerHTML = DOWN_BUTTON;
                downButton.setAttribute("name", `DOWN_${i}`);
                downButton.setAttribute("class", "lift-btn");
                downButton.onclick = buttonEvent;
                floor.appendChild(downButton);
            }

            let liftCallAudioUp = document.createElement("audio");
            liftCallAudioUp.src = "/assets/elevator-ding.mp3";

            let liftCallAudioDown = document.createElement("audio");
            liftCallAudioDown.src = "/assets/elevator-ding.mp3";

            
            floor.appendChild(liftCallAudioUp);
            floor.appendChild(liftCallAudioDown);
            
            let floorName = document.createElement("p");
            floorName.innerText = `Floor ${i}`;
            
            floor.appendChild(floorName);
            console.log(i, floor);
            FLOORS.push({
                id: i,
                element: floor,
                liftCallAudioUp: liftCallAudioUp,
                liftCallAudioDown: liftCallAudioDown
            });
            
        }
    }

    function createLifts(num_lift) {
        for( let i=0; i<num_lift; i++) {
            let lift = document.createElement("div");
            lift.setAttribute("class", "lift");

            let door = document.createElement("div");
            door.setAttribute("class", "door");

            lift.appendChild(door);

            let liftDoorOpenAudio = document.createElement("audio");
            liftDoorOpenAudio.src = "/assets/LiftDoorOpening.m4a";
            
            let liftDoorCloseAudio = document.createElement("audio");
            liftDoorCloseAudio.src = "/assets/LiftDoorClosing.m4a";

            lift.appendChild(liftDoorOpenAudio);
            lift.appendChild(liftDoorCloseAudio);

            console.log(100 * i,lift);

            LIFTS.push({
                id: i,
                floor: 0,
                isMoving: false,
                element: lift,
                door: door,
                liftDoorOpenAudio: liftDoorOpenAudio,
                liftDoorCloseAudio: liftDoorCloseAudio
            });
        }
    }

    function createHeader() {
        let backButton = document.createElement("button");
        backButton.onclick = function(){window.location.reload()};
        backButton.innerHTML = BACK_BUTTON;
        console.log(backButton.onClick);
        let muteButton = document.createElement("button");
        muteButton.setAttribute("id", "mute-btn");
        muteButton.onclick = muteEvent;
        muteButton.innerHTML = muted ? UNMUTE_BUTTON : MUTE_BUTTON;
        let header = document.createElement("div");
        header.setAttribute("class", "header");

        let form = document.createElement("div");
        form.innerHTML = `
        <label for="num-floor">Floors</label>
        <input type="number" id="num-floor" name="num-floor" min="2" value="${FLOORS.length - 1}">

        <label for="num-lift">Lifts</label>
        <input type="number" id="num-lift" name="num-lift" min="1" value="${LIFTS.length}">
        `
        let submitBtn = document.createElement("input");
        submitBtn.type = "submit";
        submitBtn.value = "Simulate";
        submitBtn.onclick = handleSubmit;
        
        form.appendChild(submitBtn);

        header.appendChild(backButton);
        header.appendChild(form);
        header.appendChild(muteButton);

        return header;
    }

    function renderFloors() {
        let root = document.getElementById("root");
        let floors = document.createElement("div");

        for(let i=FLOORS.length-1; i>=0; i--) {
            floors.appendChild(FLOORS[i].element);
        }

        root.innerHTML = "";
    
        root.appendChild(createHeader());
        root.appendChild(floors);

    }

    function renderLifts() {
        let root = document.getElementById("root");
        let liftsContainer = document.createElement("div");
        liftsContainer.setAttribute("class", "lifts-container")
        for(let lift in LIFTS) {
            liftsContainer.appendChild(LIFTS[lift].element);
        }

        root.appendChild(liftsContainer);
    }

    function buttonEvent(event) {
        let button = event.currentTarget;
        let buttonData = button.name.split("_");
        let direction = buttonData[0];
        let floor = buttonData[1];
        console.log(direction, floor);

        let alradyInQueue = QUEUE.findIndex((el) => {return (el.floor === floor) && (el.direction === direction)});

        if(alradyInQueue != -1) {
            console.log("already in queue ", floor);
            return;
        }   

        direction == "UP" ? FLOORS[floor].liftCallAudioUp.play() : FLOORS[floor].liftCallAudioDown.play();

        button.innerHTML = direction == "UP" ? UP_BUTTON_ANIMATED : DOWN_BUTTON_ANIMATED;

        QUEUE.push({
            floor: floor,
            direction: direction,
            button: button 
        });

        let lift = getLift(floor);

        if(lift != -1) {
            completePendinRequests();
        } 
        
    }

    function getLift(floor) {
        let availableLifts = LIFTS.filter(lift => lift.isMoving == false);
        console.log("Av:", availableLifts);
        if(availableLifts.length == 0)
            return -1;
        
        let selectedLift = availableLifts[0].id; 
        console.log(availableLifts);
        
        for(let i in availableLifts) {
            console.log(availableLifts[i].id, availableLifts[i].floor);
            if(Math.abs(floor - availableLifts[i].floor) < Math.abs(floor - LIFTS[selectedLift].floor)) {
                selectedLift = availableLifts[i].id;
            }
        }

        console.log(selectedLift);

        return selectedLift;
    }

    function moveLift(liftId, floor, direction, button) {

        console.log(`Lift ${liftId} is moving to floor ${floor}`);
        LIFTS[liftId].isMoving = true;
        let currentFloor = LIFTS[liftId].floor;
        floor = parseInt(floor);
        LIFTS[liftId].floor = floor;



        LIFTS[liftId].element.style.transform = `translate(0px, ${((floor * 100)+(floor + floor-1)) * -1}px)`;
        LIFTS[liftId].element.style.transition = `transform ${Math.abs(floor - currentFloor) * 2}s`;
        console.log(LIFTS);
        setTimeout(() => {
            
            button.innerHTML = direction == "UP" ? UP_BUTTON : DOWN_BUTTON;
            LIFTS[liftId].door.style.backgroundColor = "aqua";
            LIFTS[liftId].door.style.transform = `scaleX(80)`;
            LIFTS[liftId].door.style.transition = `transform 2.5s`;
            LIFTS[liftId].liftDoorOpenAudio.play();
            setTimeout(() => {
                LIFTS[liftId].door.style.transform = `scaleX(0)`;
                LIFTS[liftId].door.style.transition = `transform 2.5s`;
                LIFTS[liftId].liftDoorCloseAudio.play();
            }, 3000);
            setTimeout(() => {
                LIFTS[liftId].isMoving = false;
                completePendinRequests();
            }, 5500);
            console.log(`Lift ${liftId} has reached floor ${floor}`);
            console.log(LIFTS);
        }, (Math.abs(floor - currentFloor) * 2000))
    }

    function completePendinRequests() {
        if(QUEUE.length > 0) {
            let cur_floor = QUEUE[0].floor;
            let cur_direction = QUEUE[0].direction;
            let cur_button = QUEUE[0].button;
            let lift = getLift(cur_floor);
            console.log("Available lift: ", lift);

            QUEUE.shift();

            moveLift(lift, cur_floor, cur_direction, cur_button);
        }
    }

    function muteEvent() {
        muted = ~muted;
        let muteButton = document.getElementById("mute-btn");
        muteButton.innerHTML = muted ? UNMUTE_BUTTON : MUTE_BUTTON;
        document.querySelectorAll("audio").forEach((elem) => {
            elem.muted = muted;
        });
    }
}
