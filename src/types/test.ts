import { Question } from "./question"

export type Test = {
    id: string;
    school: string;
    teacher: string;
    title: string;
    questions: Question[];
}