const Appapi = (() => {
    baseurl = 'http://localhost:3000';
    path = "events";

    const getEvents = () =>
        //fetch([baseurl, path].join("/")).then((response) => response.json());
        $.ajax({
            url: [baseurl, path].join("/"),
        });

    const addEvents = (event) =>
        $.ajax({
            type: "POST",
            url: [baseurl, path].join("/"),
            data: event,
        });
    const deleteEvents = id =>
        $.ajax({
            type: "DELETE",
            url: [baseurl, path, id].join("/"),
        });

    const updateEvents = (id, event) =>
        $.ajax({
            type: "PUT",
            url: [baseurl, path, id].join("/"),
            data: event
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
        let D = parseInt(date.getDate())+1;
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
            //console.log(formatDate(startdate));
            tmp += `
                <li class="flex-containter" id="${ele.id}">
                    <input class="event-item event-input-box name-input" name="eventName" disabled value="${ele.eventName}">
                    <input class="event-item event-input-box startDate-input" type="date" name="startDate" disabled value="${formatDate(startdate)}">
                    <input class="event-item event-input-box endDate-input" type="date" name="endDate"  disabled value="${formatDate(enddate)}">
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
        <input class="event-item event-input-box"  name="eventName" id="addfield-name">
        <input class="event-item event-input-box" type="date" name="startDate" id="addfield-startDate">
        <input class="event-item event-input-box" type="date" name="endDate" id="addfield-endDate">
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
        constructor(name, start_date, end_date) {
            this.startDate = start_date;
            this.endDate = end_date;
            this.eventName = name;
        }
    }

    class State {
        #eventslist = [];
        #AddField = false;
        #pageSize = 2;

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
            view.render(ele, tmp);

            //bind addfield close btn
            $(view.domstr.addfield_closeBtn).bind("click", (event) => {
                event.preventDefault();
                this.#AddField = false;
                $(view.domstr.addFiled).addClass("hidden");
            });


            //bind addfield save btn
            $(view.domstr.addfield_saveBtn).bind("click", (event) => {
                event.preventDefault();
                this.#AddField = false;
                const addFiled = document.querySelector(view.domstr.addFiled);
                addFiled.classList.add("hidden");

                //get the data:
                let name = $(view.domstr.addfield_name).val();
                let endDate = document.querySelector(view.domstr.addfield_endDate).valueAsNumber;
                let startDate = document.querySelector(view.domstr.addfield_startDate).valueAsNumber;
                const new_event = new Events(name, startDate, endDate);


                api.addEvents(new_event).then((newEventlists) => {
                    this.#eventslist = [newEventlists, ...this.#eventslist];
                    console.log(this.#eventslist);
                    name.value = "";
                    endDate.value = "";
                    startDate.value = "";
                });

            });

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
        //const addBtn = $(view.domstr.addBtn);

        $(view.domstr.addBtn).bind("click", (event) => {
            event.preventDefault();
            if (!state.AddField) {
                state.AddField = true;
                $(view.domstr.addFiled).removeClass("hidden");
            }
        });
    };

    const BtnEvents = () => {
        $(view.domstr.eventslist).bind("click", (event) => {
            const nodeId = parseInt(event.target.parentNode.parentNode.id);
            //delete events
            if (event.target.classList.contains("delete_btn")) {
                if (nodeId !== '') {
                    state.eventslist = state.eventslist.filter((ev) => {
                        return +ev.id !== +nodeId;
                    });
                    model.deleteEvents(nodeId);
                }
            }
            //edit events
            if (event.target.classList.contains("edit_btn")) {
                if (nodeId !== '') {
                    //switch the button groups:
                    const node = event.target.parentNode.parentNode;
                    const btn_group1 = $(`#${nodeId} .bt-group-1`);
                    const btn_group2 = $(`#${nodeId} .bt-group-2`);
                    btn_group2.addClass("show");
                    btn_group2.removeClass("hidden");
                    btn_group1.addClass("hidden");
                    btn_group1.removeClass("show");

                    //let inputbox enable
                    const nameInput = $(`#${nodeId} .name-input`)[0];
                    console.log(nameInput);
                    const startDateInput = $(`#${nodeId} .startDate-input`)[0];
                    const endDateInput = $(`#${nodeId} .endDate-input`)[0];

                    nameInput.disabled = false;
                    startDateInput.disabled = false;
                    endDateInput.disabled = false;
                }
            }
            
            //save events
            if (event.target.classList.contains("save_btn")) {
                if (nodeId !== '') {
                    //get the data:
                    let name = $(`#${nodeId} .name-input`).val();
                    let startDate = $(`#${nodeId} .startDate-input`)[0].valueAsNumber;
                    let endDate = $(`#${nodeId} .endDate-input`)[0].valueAsNumber;
                    let edit_event = new model.Events(name, startDate, endDate);
                    model.updateEvents(nodeId, edit_event);
                }

            }

            //Close events:
            if (event.target.classList.contains("close_btn")) {
                if (nodeId !== '') {
                    //switch the button groups:
                    const btn_group1 = $(`#${nodeId} .bt-group-1`);
                    const btn_group2 = $(`#${nodeId} .bt-group-2`);
                    btn_group1.addClass("show");
                    btn_group1.removeClass("hidden");
                    btn_group2.addClass("hidden");
                    btn_group2.removeClass("show");

                    //let inputbox enable
                    const nameInput = $(`#${nodeId} .name-input`)[0];
                    const startDateInput = $(`#${nodeId} .startDate-input`)[0];
                    const endDateInput = $(`#${nodeId} .endDate-input`)[0];

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

    const bootstrap = () => {
        init();
        BtnEvents();
        addEvents();
    };

    return { bootstrap };
})(Model, View);

Controller.bootstrap();