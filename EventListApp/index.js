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

    const updateEvents = (id,events) =>
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
        eventslist: "#eventlist__container",
        deletebtn: ".delete_btn",
        inputbox: ".todolist__input",
    };
    const render = (element, tmp) => {
        element.innerHTML = tmp;
    };
    const createTmp = (arr) => {
        let tmp = "";
        arr.forEach((ele) => {
            tmp += `
                <li>
                    <span>${ele.title}</span>
                    <button class="delete_btn" id="${ele.id}">
                        X
                    </button>
                </li>
            `;
        });
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
        constructor(title) {
            this.userId = 20;
            this.title = title;
            this.completed = false;
        }
    }

    class State {
        #eventslist = [];

        get eventslist() {
            return this.#eventslist;
        }

        set eventslist(newdata) {
            this.#eventslist = newdata;

            // render the todolist
            const ele = document.querySelector(view.domstr.eventslist);
            const tmp = view.createTmp(this.#eventslist);
            view.render(ele, tmp);
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
        const inputbox = document.querySelector(view.domstr.inputbox);

        inputbox.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                const todo = new model.Todo(event.target.value);
                model.addTodo(todo).then(newtodo => {
                    state.todolist = [newtodo, ...state.todolist];
                    event.target.value = '';
                });
            }
        });
    };

    const deleteEvents = () => {
        const ele = document.querySelector(view.domstr.todolist);
        ele.addEventListener("click", (event) => {
            state.todolist = state.todolist.filter((todo) => {
                return +todo.id !== +event.target.id;
            });
            model.deleteTodo(event.target.id);
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
        deletTodo();
        addTodo();
    };

    return { bootstrap };
})(Model, View);

Controller.bootstrap();