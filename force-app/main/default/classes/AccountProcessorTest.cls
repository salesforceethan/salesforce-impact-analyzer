@IsTest
public class AccountProcessorTest {

    @IsTest
    static void testCountContacts_updatesCounts() {

        Account a1 = new Account(Name = 'A1');
        Account a2 = new Account(Name = 'A2');
        insert new List<Account>{ a1, a2 };

        insert new List<Contact>{
            new Contact(LastName = 'C1', AccountId = a1.Id),
            new Contact(LastName = 'C2', AccountId = a1.Id)
        };

        Test.startTest();
        AccountProcessor.countContacts(new List<Id>{ a1.Id, a2.Id });
        Test.stopTest(); // forces @future to execute

        Map<Id, Account> results = new Map<Id, Account>([
            SELECT Id, Number_Of_Contacts__c
            FROM Account
            WHERE Id IN :new List<Id>{ a1.Id, a2.Id }
        ]);

        System.assertEquals(2, results.get(a1.Id).Number_Of_Contacts__c);
        System.assertEquals(0, results.get(a2.Id).Number_Of_Contacts__c);
    }

    @IsTest
    static void testCountContacts_handlesEmptyInput() {
        Test.startTest();
        AccountProcessor.countContacts(new List<Id>());
        Test.stopTest();
        System.assert(true);
    }
}