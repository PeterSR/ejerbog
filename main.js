const possible_states = ["paste", "pick-columns", "pick-attendance", "export"]

const App = {
    el: "#root",
    data() {
        return {
            state: "paste",
            paste_content: "",
            table: [],
            ejerbog: [],
        }
    },
    methods: {
        paste_done() {
            this.table = this.parse_table(this.paste_content)
            this.pick_columns_done()
        },
        pick_columns_done() {
            const hardcoded_picks = {
                "person": 0,
                "ownership": 1,
            }

            this.ejerbog = this.table.map((row) => {
                const person = row[hardcoded_picks["person"]]
                const ownership = this.parse_ownership(row[hardcoded_picks["ownership"]])
                return {
                    person: person,
                    ownership: ownership,
                    attending: false,
                }
            })

            this.state = "pick-attendance"
        },
        toggle_attendance(entry) {
            entry.attending = !entry.attending
        },
        parse_table(paste_content) {
            const lines = paste_content.split("\n")
            const table = lines.filter((line) => {
                return line
            }).map((line) => {
                return line.split("\t")
            })
            return table
        },
        parse_ownership(str) {
            str = str.replace(",", ".")
            return parseFloat(str)
        },
        export_to_file() {
            const lines = this.ejerbog.filter((entry) => {
                return entry.attending
            }).map((entry) => {
                return entry.person + ";" + entry.ownership
            })

            const last_line = "total_attendance;" + this.attendance_percentage

            const content = lines.join("\n") + "\n" + last_line

            download(content, "attendance.txt", "text/plain")
        },
    },
    computed: {
        table_header() {
            if (this.table && this.table.length > 0) {
                const first_row = this.table[0]
                return [...Array(first_row.length).keys()]
            } else {
                return []
            }
        },
        attendance_percentage() {
            const sum = this.ejerbog.reduce((acc, entry) => {
                return acc + (entry.attending ? entry.ownership : 0)
            }, 0)

            return sum.toPrecision(3)
        },
        attendance_count() {
            const sum = this.ejerbog.reduce((acc, entry) => {
                return acc + (entry.attending ? 1 : 0)
            }, 0)

            return sum
        },
    }
}

$(document).ready(function() {
    const app = new Vue(App)
})