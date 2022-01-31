const Appapi = (() => {
    baseurl = 'http://localhost:3000';
    path = "events";

    const getEvents = () =>
        fetch([baseurl, path].join("/")).then((response) => response.json());

    const addEvents = (events) =>
        fetch([baseurl, path].join("/"), {
            method: "POST",
            body: JSON.stringify(events),
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }).then((response) => response.json());

    const deleteEvents = (id) =>
        fetch([baseurl, path, id].join("/"), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

    const updateEvents = (id, events) =>
        fetch([baseurl, path, id].join("/"), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(events),
        });


    return {
        deleteEvents,
        getEvents,
        addEvents,
        updateEvents,
    };
})();

//------------------------------- View ---------------------------------------- 
const View = (() => {
    const domstr = {
        eventslist: "#eventslist__container",
        deletebtn: ".delete_btn",
        addBtn: "#eventslist-addbtn",
        addfield_closeBtn: "#addfield-closebtn",
        addFiled: "#add_field",
        addfield_saveBtn: "#addfield-savebtn",
        addfield_name: "#addfield-name",
        addfield_startDate: "#addfield-startDate",
        addfield_endDate: "#addfield-endDate",
    };
    const render = (element, tmp) => {
        element.innerHTML = tmp;
    };
    const formatDate = (date) => {
        let M = parseInt(date.getMonth()) + 1;
        if (M < 10) {
            M = "0" + M;
        }
        let D = parseInt(date.getDate());
        if (D < 10) {
            D = "0" + D;
        }
        return date.getFullYear() + "-" + M + "-" + D;
    }

    const createTmp = (arr) => {
        let tmp = "";
        arr.forEach((ele) => {
            let startdate = new Date(+ele.startDate);
            let enddate = new Date(+ele.endDate);
            console.log(formatDate(startdate));
            tmp += `
                <li class="flex-containter" id="${ele.id}">
                    <input class="event-item event-input-box" name="eventName" disabled value="${ele.eventName}">
                    <input class="event-item event-input-box" name="startDate" disabled value="${formatDate(startdate)}">
                    <input class="event-item event-input-box" name="endDate"  disabled value="${formatDate(enddate)}">
                    <div class="event-btn-group bt-group-1 show">
                    <button class="event-btns edit_btn" type="button">Edit</button>
                    <button class="event-btns delete_btn" type="button">Delete</button>
                    </div>
                    <div class="event-btn-group  bt-group-2 hidden">
                    <button class="event-btns save_btn" type="button">SAVE </button>
                    <button class="event-btns close_btn" type="button">CLOSE</button>
                    </div>
                </li>
            `;
        });
        tmp += `
        <li class="flex-containter hidden" id="add_field">
        <input class="event-item event-input-box" name="eventName" id="addfield-name">
        <input class="event-item event-input-box" name="startDate" id="addfield-startDate">
        <input class="event-item event-input-box" name="endDate" id="addfield-endDate">
        <div class="event-btn-group show">
        <button class="event-btns" type="button" id="addfield-savebtn" >SAVE</button>
        <button class="event-btns" type="button" id="addfield-closebtn">CLOSE</button>
        </div>
        </li>
        `
        return tmp;
    };

    return {
        domstr,
        render,
        createTmp,
    };
})();

//------------------------------- Model---------------------------------------- 
const Model = ((api, view) => {
    class Events {
        constructor(name,start_date, end_date) {
            let startArr = start_date.split("-");
            let endArr = end_date.split("-");
            let startD = new Date();
            startD.setMonth(parseInt(startArr[1])-1);
            startD.setFullYear(parseInt(startArr[0]));
            startD.setDate(parseInt(startArr[2]));

            let endD = new Date();
            endD.setMonth(parseInt(endArr[1])-1);
            endD.setFullYear(parseInt(endArr[0]));
            endD.setDate(parseInt(endArr[2]));

            console.log(startD.getTime());

            this.startDate = startD.getTime()+"";
            this.endDate = endD.getTime()+"";
            this.eventName = name;
        }
        setId(id){
            this.id=id;
        }
    }

    class State {
        #eventslist = [];
        #AddField = false;

        get eventslist() {
            return this.#eventslist;
        }

        get AddField() {
            return this.#AddField;
        }
        set AddField(value) {
            this.#AddField = value;
        }

        set eventslist(newdata) {
            this.#eventslist = newdata;

            // render the todolist
            const ele = document.querySelector(view.domstr.eventslist);
            const tmp = view.createTmp(this.#eventslist);
            //console.log(tmp);
            //console.log(ele);
            view.render(ele, tmp);

            //bind addfield close btn
            const closeBtn = document.querySelector(view.domstr.addfield_closeBtn);
            closeBtn.addEventListener("click", (event) => {
                event.preventDefault();
                this.#AddField = false;
                const addFiled = document.querySelector(view.domstr.addFiled);
                addFiled.classList.add("hidden");
            });

            //bind addfield save btn
            const saveBtn = document.querySelector(view.domstr.addfield_saveBtn);
            saveBtn.addEventListener("click", (event) => {
                event.preventDefault();
                this.#AddField = false;
                const addFiled = document.querySelector(view.domstr.addFiled);
                addFiled.classList.add("hidden");

                //get the data:
                let name = document.querySelector(view.domstr.addfield_name);
                let endDate = document.querySelector(view.domstr.addfield_endDate);
                let startDate = document.querySelector(view.domstr.addfield_startDate);

                const new_event = new Events(name.value, startDate.value, endDate.value);
                
                api.addEvents(new_event).then((newEventlists) => {
                    this.#eventslist = [newEventlists, ...this.#eventslist];
                    console.log(this.#eventslist);
                    name.value="";
                    endDate.value="";
                    startDate.value="";
                });
                

            });

            /*
            //bind the deleteBtn
            const deleteBtn = document.querySelector(view.domstr.deletebtn);
            deleteBtn.addEventListener("click", (event) => {
                const deleteid = parseInt(event.target.parentNode.parentNode.id);
                console.log("deleteid:",deleteid);
                console.log(event.target.parentNode.parentNode);
                this.#eventslist = this.#eventslist.filter((ele) => {
                    return +ele.id !== deleteid;
                });
                console.log(this.#eventslist);
                //api.deleteEvents(deleteid);
            });
            */
        }
    }

    const deleteEvents = api.deleteEvents;
    const getEvents = api.getEvents;
    const addEvents = api.addEvents;
    const updateEvents = api.updateEvents;

    return {
        Events,
        State,
        addEvents,
        getEvents,
        deleteEvents,
        updateEvents,
    };
})(Appapi, View);

//------------------------------- Controller ---------------------------------------- 
const Controller = ((model, view) => {
    const state = new model.State();

    const addEvents = () => {
        const addBtn = document.querySelector(view.domstr.addBtn);

        addBtn.addEventListener("click", (event) => {
            if (!state.AddField) {
                state.AddField = true;
                const addFiled = document.querySelector(view.domstr.addFiled);
                addFiled.classList.remove("hidden");
            }
        });
    };

    const BtnEvents = () => {
        const ele = document.querySelector(view.domstr.eventslist);
        console.log(ele);
        ele.addEventListener("click", (event) => {
            event.preventDefault();
            const nodeId = parseInt(event.target.parentNode.parentNode.id);
            //delete events
            if(event.target.classList.contains("delete_btn")){
                if (nodeId !== '') {
                    state.eventslist = state.eventslist.filter((ev) => {
                        return +ev.id !== +nodeId;
                    });
                    model.deleteEvents(nodeId);
                }
            }
            //edit events
            if(event.target.classList.contains("edit_btn")){
                if (nodeId !== '') {
                    //switch the button groups:
                    const node = event.target.parentNode.parentNode;
                    const btn_group1 = event.target.parentNode;
                    const btn_group2 = (node.childNodes)[9];
                    console.log(node.childNodes);
                    btn_group2.classList.add("show");
                    btn_group2.classList.remove("hidden");
                    btn_group1.classList.add("hidden");
                    btn_group1.classList.remove("show");

                    //let inputbox enable
                    const nameInput = (node.childNodes)[1];
                    const startDateInput = (node.childNodes)[3];
                    const endDateInput = (node.childNodes)[5];

                    nameInput.disabled = false;
                    startDateInput.disabled = false;
                    endDateInput.disabled = false;
                }
            }

            //save events
            if(event.target.classList.contains("save_btn")){
                if (nodeId !== '') {
                    //get the data:
                    const node = event.target.parentNode.parentNode;
                    const nameInput = (node.childNodes)[1];
                    const startDateInput = (node.childNodes)[3];
                    const endDateInput = (node.childNodes)[5];
                    /*
                    state.eventslist.forEach((ele)=>{
                        if(+ele.id===nodeId){
                            console.log(ele);
                            ele.eventName=nameInput.value;
                            ele.startDate
                            ele
                        }
                    })
                    */
                    let edit_event = new model.Events(nameInput.value, startDateInput.value, endDateInput.value);                    
                    model.updateEvents(nodeId,edit_event).then((newEventlists) => {
                        state.eventslist = newEventlists;
                        console.log(state.eventslist);
                    });
                    }
            }
            //Close events:
            if(event.target.classList.contains("close_btn")){
                if (nodeId !== '') {
                    //switch the button groups:
                    const node = event.target.parentNode.parentNode;
                    const btn_group2 = event.target.parentNode;
                    const btn_group1 = (node.childNodes)[7];
                    console.log(btn_group1);
                    btn_group2.classList.add("hidden");
                    btn_group2.classList.remove("show");
                    btn_group1.classList.add("show");
                    btn_group1.classList.remove("hidden");

                    //let inputbox enable
                    const nameInput = (node.childNodes)[1];
                    const startDateInput = (node.childNodes)[3];
                    const endDateInput = (node.childNodes)[5];

                    nameInput.disabled = true;
                    startDateInput.disabled = true;
                    endDateInput.disabled = true;
                }
            }

        });
    };

    const init = () => {
        model.getEvents().then((data) => {
            console.log(data);
            state.eventslist = data;
        });
    };

    const addFiledBtns = () => {
    
    }

    const bootstrap = () => {
        init();
        BtnEvents();
        addEvents();
    };

    return { bootstrap };
})(Model, View);

Controller.bootstrap();