window.onload = function() {
    var form = document.getElementById("myForm");
    form.addEventListener('submit', handleSubmit);

    let FLOORS = [];
    let LIFTS = [];


    function handleSubmit(event) {
        console.log("hello");
        console.log(screen.availWidth)
        event.preventDefault();
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
            let upButton = document.createElement("button");
            upButton.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;
            upButton.setAttribute("name", `UP_${i}`)
            upButton.setAttribute("class", "lift-btn");
            upButton.onclick = buttonEvent;
            let downButton = document.createElement("button");
            downButton.innerHTML = `<i class="fa-solid fa-arrow-down"></i>`;
            downButton.setAttribute("name", `DOWN_${i}`);
            downButton.setAttribute("class", "lift-btn");
            downButton.onclick = buttonEvent;
            let floorName = document.createElement("p");
            floorName.innerText = `Floor ${i}`;
            floor.appendChild(upButton);
            floor.appendChild(downButton);
            floor.appendChild(floorName);
            console.log(i, floor);
            FLOORS.push({
                id: i,
                element: floor
            });
            
        }
    }

    function createLifts(num_lift) {
        for( let i=0; i<num_lift; i++) {
            let lift = document.createElement("div");
            lift.setAttribute("class", "lift");
            //lift.style.left = `${250 + 200*i}px`;
            //lift.style.bottom = "0px";

            let door = document.createElement("div");
            door.setAttribute("class", "door");

            lift.appendChild(door);

            let liftStartAudio = document.createElement("audio");
            liftStartAudio.src = "/assets/elevator-ding.mp3";

            let liftDoorOpenAudio = document.createElement("audio");
            liftDoorOpenAudio.src = "/assets/LiftDoorOpening.m4a";
            
            let liftDoorCloseAudio = document.createElement("audio");
            liftDoorCloseAudio.src = "/assets/LiftDoorClosing.m4a";

            console.log(100 * i,lift);

            LIFTS.push({
                id: i,
                floor: 0,
                isMoving: false,
                element: lift,
                door: door,
                liftStartAudio: liftStartAudio,
                liftDoorOpenAudio: liftDoorOpenAudio,
                liftDoorCloseAudio: liftDoorCloseAudio
            });
        }
    }

    function renderFloors() {
        let root = document.getElementById("root");
        let floors = document.createElement("div");

        for(let i=FLOORS.length-1; i>=0; i--) {
            floors.appendChild(FLOORS[i].element);
        }

        root.innerHTML = "";
    
        let backButton = document.createElement("button");
        backButton.onclick = function(){window.location.reload()};
        backButton.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
        console.log(backButton.onClick);
        root.appendChild(backButton);

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
        console.log(event);
        let buttonData = button.name.split("_");
        let direction = buttonData[0];
        let floor = buttonData[1];
        console.log(direction, floor);
        let lift = getLift(floor);
        if(lift == -1) {
            console.log("All lifts are busy");
            return;
        }

        // if(LIFTS[lift].floor == floor) {
        //     console.log("Lift already present at the floor: ", floor);
        //     return;
        // }

        moveLift(lift, floor, direction, button);
    }

    function getLift(floor) {
        let availableLifts = LIFTS.filter(lift => lift.isMoving == false);
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

        button.innerHTML = direction == "UP" ? `<i class="fa-solid fa-arrow-up fa-beat" style="color: #bbdf07;"></i>` : `<i class="fa-solid fa-arrow-down fa-beat" style="color: #bbdf07;"></i>`;

        LIFTS[liftId].liftStartAudio.play();

        LIFTS[liftId].element.style.transform = `translate(0px, ${((floor * 100)+(floor + floor-1)) * -1}px)`;
        LIFTS[liftId].element.style.transition = `transform ${Math.abs(floor - currentFloor) * 2}s`;
        //LIFTS[liftId].door.innerHTML = floor > currentFloor ? `<i class="fa-solid fa-arrow-up fa-bounce" style="color: #df073d;"></i>` : `<i class="fa-solid fa-arrow-down fa-bounce" style="color: #df073d;"></i>`;
        console.log(LIFTS);
        setTimeout(() => {
            
            button.innerHTML = direction == "UP" ? `<i class="fa-solid fa-arrow-up"></i>` : `<i class="fa-solid fa-arrow-down"></i>`;
            //LIFTS[liftId].element.innerHTML = "OPEN";
            LIFTS[liftId].door.style.backgroundColor = "aqua";
            LIFTS[liftId].door.style.transform = `scaleX(80)`;
            LIFTS[liftId].door.style.transition = `transform 2.5s`;
            LIFTS[liftId].liftDoorOpenAudio.play();
            setTimeout(() => {
                
                //LIFTS[liftId].element.innerHTML = "CLOSE";
                LIFTS[liftId].door.style.transform = `scaleX(0)`;
                LIFTS[liftId].door.style.transition = `transform 2.5s`;
                LIFTS[liftId].liftDoorCloseAudio.play();
            }, 3000);
            setTimeout(() => {
                LIFTS[liftId].isMoving = false;
            }, 5500);
            console.log(`Lift ${liftId} has reached floor ${floor}`);
            console.log(LIFTS);
        }, (Math.abs(floor - currentFloor) * 2000))
    }
    
}

