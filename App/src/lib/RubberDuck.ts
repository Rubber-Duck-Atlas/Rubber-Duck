export default function RubberDuck(query: string, searchNotes: boolean) {
    return window.api.runRubberDuckQuery(query, searchNotes);
}