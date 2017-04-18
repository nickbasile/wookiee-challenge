new Vue({
    //Bind Vue to the DOM
    el: '#js-vue-binder',
    data: {
        //Stores all of the people who need heights
        people: [
            {name:'Han Solo', search: 'Han Solo', height: 0, wookieeRatio: 0},
            {name:'Darth', search: 'Darth Vader', height: 0, wookieeRatio: 0},
            {name:'Luke', search: 'Luke Skywalker', height: 0, wookieeRatio: 0},
            {name:'Jabba', search: 'Jabba', height: 0, wookieeRatio: 0}
        ],
        //Average height of a wookiee
        wookieeHeight: 211,
        //Holds the person selected in the interface
        selectedPerson: {},
        //The feet provided by the user
        feet: '',
        //The inches provided by the user
        inches: '',
        //Toggles the welcome animation
        welcome: true,
        //Toggles the error animation
        error: false
    },
    computed: {
        //Calculates the height for the wookiee clip on the fly
        clipHeight: function () {
            const t = this;
            let height = 0;

            if(t.selectedPerson.name != undefined) {
                height = t.selectedPerson.wookieeRatio * 500;
            }

            return height;
        },
        //Calculates the tooltip position on the fly
        tooltipHeight: function () {
            const t = this;

            if (t.selectedPerson.wookieeRatio >= 1) {
                return 0;
            }

            return (500 - t.clipHeight) - 26;
        }
    },
    watch: {
        //Resets the error when the animation is done
        error: function () {
            const t = this;
            if (t.error == true) {
                setTimeout(function () {
                    t.error = false;
                }, 2000);
            }
        }
    },
    created() {
        const t = this;

        //Makes the API calls to SWAPI for the heights
        t.getHeights();

        //Turns the welcome animation off
        setTimeout(function () {
            t.welcome = false;
        }, 2000);
    },
    methods: {
        //A function that gets the height from SWAPI for a specific person and adds it to their data
        getHeights: function () {
            const t = this;

            t.people.forEach(function (person) {
                let query = encodeURIComponent(person.search);

                axios.get('http://swapi.co/api/people/?search=' + query)
                    .then(function (response) {
                        person.height = t.setHeight(response.data.results, person.name);
                        person.wookieeRatio = t.setWookieeRatio(person.height);
                    })
                    .catch(function (error) {
                        t.error = true;
                        console.log(error);
                    });
            });
        },
        //Finds the matching person from the results and sets their height
        setHeight: function (results, name) {
            let height = 0;

            results.some(function (result) {
                if(result.name.includes(name)) {
                    height = parseInt(result.height);
                }
            });

            return height;
        },
        //Calculates a person's wookiee ratio based on their height
        setWookieeRatio: function (height) {
            let ratio = height / this.wookieeHeight;
            let decimal = ratio.toFixed(2);
            return parseFloat(decimal);
        },
        //Toggles the selected person data
        selectPerson: function (person) {
            const t = this;

            person.name == t.selectedPerson.name ? t.selectedPerson = {} : t.selectedPerson = person;
        },
        //Calculates the user's height and wookiee ratio based on their inputs, then sets them as the selectedPerson
        //Fires an error if there is no input
        checkUserHeight: function () {
            const t = this;
            let person = {
                name: 'You are',
                search: ''
            };

            if(t.feet.length != 0 || t.inches.length != 0) {
                let inches = t.feet * 12 + t.inches;
                let cm = Math.ceil(inches * 2.54);

                person.height = cm;
                person.wookieeRatio = t.setWookieeRatio(cm);

                t.selectedPerson = person;
            } else {
                t.error = true;
            }
        }
    }
});