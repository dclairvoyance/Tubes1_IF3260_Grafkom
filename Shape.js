class Shape {
    static count = 0;

    constructor(id) {
        this.id = id = ++this.constructor.count;
        this.type = "";
        this.vertices = [];
        this.colors = [];
        this.theta = 0;
    }
}