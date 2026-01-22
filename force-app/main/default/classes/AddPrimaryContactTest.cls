@IsTest
public class AddPrimaryContactTest {

    @IsTest
    static void testAddsContactsForCAAccounts() {

        // Create 50 NY Accounts + 50 CA Accounts
        List<Account> accountsToInsert = new List<Account>();

        for (Integer i = 0; i < 50; i++) {
            accountsToInsert.add(new Account(Name = 'NY Acct ' + i, BillingState = 'NY'));
            accountsToInsert.add(new Account(Name = 'CA Acct ' + i, BillingState = 'CA'));
        }
        insert accountsToInsert;

        // Template contact (must include required fields)
        Contact template = new Contact(
            LastName = 'Primary Contact',
            FirstName = 'Test'
        );

        Test.startTest();
        System.enqueueJob(new AddPrimaryContact(template, 'CA'));
        Test.stopTest(); // forces queueable to run
       
        // Get CA account Ids
        Set<Id> caAccountIds = new Set<Id>();
        for (Account a : [SELECT Id FROM Account WHERE BillingState = 'CA']) {
            caAccountIds.add(a.Id);
        }

        // Count contacts created for CA accounts
        Integer caContacts = [
            SELECT COUNT()
            FROM Contact
            WHERE AccountId IN :caAccountIds
        ];

        System.assertEquals(50, caContacts, 'Should create 1 Contact for each CA Account');
    }
}