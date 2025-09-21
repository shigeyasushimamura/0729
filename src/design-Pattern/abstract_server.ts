// 抽象クライアント
interface CourseClient {
    receiveAssignment(title: string): void;
}

// 抽象サーバ
abstract class Course {
    protected clients: CourseClient[] = [];
    attach(client: CourseClient) {
        this.clients.push(client);
    }
    detach(client: CourseClient) {
        this.clients = this.clients.filter((c) => c !== client);
    }
    abstract distributeAssignment(title: string): void;
}

// 具体サーバ
class MathCourse extends Course {
    distributeAssignment(title: string) {
        console.log(`Distributing assignment: ${title}`);
        this.clients.forEach((c) => c.receiveAssignment(title));
    }
}

// 具体クライアント
class AliceMathClient implements CourseClient {
    receiveAssignment(title: string) {
        console.log(`Alice received: ${title}`);
    }
}

const mathCourse = new MathCourse();
const aliceClient = new AliceMathClient();
mathCourse.attach(aliceClient);

mathCourse.distributeAssignment("Linear Algebra Homework");
