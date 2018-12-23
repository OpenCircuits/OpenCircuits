/**
 * Utility class to help keep track of a string
 *  and when it has been changed
 */
export class Name {
    private name: string;
    private set: boolean;

    /**
     * Constructor for Name
     * @param name The initial name
     */
    constructor(name: string) {
        this.name = name;
        this.set = false;
    }

    /**
     * Set a new name and mark it as set
     * @param name The new name
     */
    public setName(name: string): void {
        this.name = name;
        this.set = true;
    }

    /**
     * Get the current name
     * @return the current name
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns whether or not the name
     *  has been changed
     * @return  True if the name has been changed,
     *          False otherwise
     */
    public isSet(): boolean {
        return this.set;
    }

}
