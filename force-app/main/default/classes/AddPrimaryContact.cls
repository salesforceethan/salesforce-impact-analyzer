public class AddPrimaryContact implements Queueable {

    private Contact templateContact;
    private String stateAbbrev;

    // Constructor: takes a Contact template + state
    public AddPrimaryContact(Contact c, String state) {
        this.templateContact = c;
        this.stateAbbrev = state;
    }

    public void execute(QueueableContext context) {

        // Query up to 200 Accounts in the given state
        List<Account> accts = [
            SELECT Id
            FROM Account
            WHERE BillingState = :stateAbbrev
            LIMIT 200
        ];

        List<Contact> contactsToInsert = new List<Contact>();

        for (Account a : accts) {
            // Clone the template contact (do NOT copy Id)
            Contact newC = templateContact.clone(false, true, false, false);

            // Associate to the Account
            newC.AccountId = a.Id;

            contactsToInsert.add(newC);
        }

        if (!contactsToInsert.isEmpty()) {
            insert contactsToInsert;
        }
    }
}