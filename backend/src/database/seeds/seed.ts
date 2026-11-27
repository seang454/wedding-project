import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { Wedding } from '../../modules/weddings/entities/wedding.entity';
import { BankAccount } from '../../modules/bank-accounts/entities/bank-account.entity';
import { Guest, GuestSide, InvitationStatus } from '../../modules/guests/entities/guest.entity';
import { Gift, GiftCurrency, PaymentMethod } from '../../modules/gifts/entities/gift.entity';

async function runSeed() {
  console.log('🌱 Starting database seed script...');

  const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:password123@localhost:5432/wedding_db';

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [User, Wedding, BankAccount, Guest, Gift],
    synchronize: true, // Ensures all tables exist before seeding
  });

  await dataSource.initialize();
  console.log('✅ Connected to database.');

  const userRepo = dataSource.getRepository(User);
  const weddingRepo = dataSource.getRepository(Wedding);
  const bankRepo = dataSource.getRepository(BankAccount);
  const guestRepo = dataSource.getRepository(Guest);
  const giftRepo = dataSource.getRepository(Gift);

  // 1. Create or Find Owner
  const hashedPassword = await bcrypt.hash('password123', 10);
  let owner = await userRepo.findOne({ where: { email: 'owner@wedding.com' } });
  if (!owner) {
    owner = userRepo.create({
      fullName: 'Chan Vanna & Meas Linda',
      email: 'owner@wedding.com',
      phone: '012888999',
      passwordHash: hashedPassword,
      role: UserRole.OWNER,
    });
    owner = await userRepo.save(owner);
    console.log('👤 Created Wedding Couple (Owner): owner@wedding.com');
  }

  // 2. Create Clerks
  let clerk1 = await userRepo.findOne({ where: { email: 'clerk1@wedding.com' } });
  if (!clerk1) {
    clerk1 = userRepo.create({
      fullName: 'Sok Mesa (Clerk 1)',
      email: 'clerk1@wedding.com',
      phone: '011222333',
      passwordHash: hashedPassword,
      role: UserRole.CLERK,
    });
    clerk1 = await userRepo.save(clerk1);
    console.log('👤 Created Clerk 1: clerk1@wedding.com');
  }

  let clerk2 = await userRepo.findOne({ where: { email: 'clerk2@wedding.com' } });
  if (!clerk2) {
    clerk2 = userRepo.create({
      fullName: 'Nget Pisey (Clerk 2)',
      email: 'clerk2@wedding.com',
      phone: '099444555',
      passwordHash: hashedPassword,
      role: UserRole.CLERK,
    });
    clerk2 = await userRepo.save(clerk2);
    console.log('👤 Created Clerk 2: clerk2@wedding.com');
  }

  // 3. Create Wedding
  let wedding = await weddingRepo.findOne({ where: { ownerId: owner.id } });
  if (!wedding) {
    wedding = weddingRepo.create({
      ownerId: owner.id,
      groomName: 'Chan Vanna',
      brideName: 'Meas Linda',
      weddingDate: new Date('2026-12-12'),
      venue: 'The Premier Center Sen Sok (Hall D)',
      targetAmount: 20000,
    });
    wedding = await weddingRepo.save(wedding);
    console.log('💍 Created Wedding Event: Chan Vanna & Meas Linda');
  }

  // 4. Create Bank Accounts & QR Codes
  const existingAccounts = await bankRepo.find({ where: { weddingId: wedding.id } });
  let abaAccount: BankAccount;
  if (existingAccounts.length === 0) {
    abaAccount = await bankRepo.save(
      bankRepo.create({
        weddingId: wedding.id,
        bankName: 'ABA Bank (USD)',
        accountName: 'CHAN VANNA & MEAS LINDA',
        accountNumber: '001 234 567',
        isPrimary: true,
        qrImageUrl: 'https://placehold.co/400x400/png?text=ABA+USD+QR',
      }),
    );

    await bankRepo.save(
      bankRepo.create({
        weddingId: wedding.id,
        bankName: 'ACLEDA Bank (KHR)',
        accountName: 'CHAN VANNA & MEAS LINDA',
        accountNumber: '100 987 654',
        isPrimary: false,
        qrImageUrl: 'https://placehold.co/400x400/png?text=ACLEDA+KHR+QR',
      }),
    );
    console.log('🏦 Created Bank Accounts (ABA USD & ACLEDA KHR)');
  } else {
    abaAccount = existingAccounts[0];
  }

  // 5. Create Sample Cambodia Guests
  const guestCount = await guestRepo.count({ where: { weddingId: wedding.id } });
  let sampleGuests: Guest[] = [];
  if (guestCount === 0) {
    const rawGuests = [
      {
        name: 'Sok San',
        phone: '012345678',
        side: GuestSide.GROOM,
        relationship: 'High School Friend',
        tableNumber: 1,
        province: 'Phnom Penh',
        district: 'Chamkar Mon',
        commune: 'Tonle Basak',
        village: 'Phum 1',
      },
      {
        name: 'Keo Sreymom',
        phone: '098765432',
        side: GuestSide.BRIDE,
        relationship: 'Cousin',
        tableNumber: 2,
        province: 'Phnom Penh',
        district: 'Tuol Kouk',
        commune: 'Boeng Kak 1',
        village: 'Phum 3',
      },
      {
        name: 'Heng Dara',
        phone: '077112233',
        side: GuestSide.BOTH,
        relationship: 'University Colleague',
        tableNumber: 3,
        province: 'Siem Reap',
        district: 'Krong Siem Reap',
        commune: 'Svay Dangkum',
        village: 'Mondul 1',
      },
      {
        name: 'Chea Vuthy',
        phone: '010556677',
        side: GuestSide.GROOM,
        relationship: 'Work Colleague',
        tableNumber: 4,
        province: 'Battambang',
        district: 'Krong Battambang',
        commune: 'Svay Pao',
        village: 'Kamkor',
      },
      {
        name: 'Ly Rotha',
        phone: '015998877',
        side: GuestSide.BRIDE,
        relationship: 'Sister',
        tableNumber: 5,
        province: 'Kandal',
        district: 'Krong Ta Khmau',
        commune: 'Ta Khmau',
        village: 'Prek Long',
      },
    ];

    for (const g of rawGuests) {
      const saved = await guestRepo.save(
        guestRepo.create({
          weddingId: wedding.id,
          ...g,
          invitationStatus: InvitationStatus.INVITED,
        }),
      );
      sampleGuests.push(saved);
    }
    console.log(`👥 Created ${sampleGuests.length} sample guests with Cambodia administrative divisions.`);
  } else {
    sampleGuests = await guestRepo.find({ where: { weddingId: wedding.id } });
  }

  // 6. Record Initial Gifts
  const giftCount = await giftRepo.count({ where: { weddingId: wedding.id } });
  if (giftCount === 0 && sampleGuests.length >= 2) {
    // Gift 1: Cash USD
    await giftRepo.save(
      giftRepo.create({
        weddingId: wedding.id,
        guestId: sampleGuests[0].id,
        guestNameSnapshot: sampleGuests[0].name,
        amount: 50.0,
        currency: GiftCurrency.USD,
        paymentMethod: PaymentMethod.CASH,
        wishes: 'Congratulations! Wishing you everlasting love!',
        recordedBy: clerk1.id,
      }),
    );

    // Gift 2: QR Payment USD
    await giftRepo.save(
      giftRepo.create({
        weddingId: wedding.id,
        guestId: sampleGuests[1].id,
        guestNameSnapshot: sampleGuests[1].name,
        amount: 100.0,
        currency: GiftCurrency.USD,
        paymentMethod: PaymentMethod.QR_CODE,
        bankAccountId: abaAccount?.id,
        transactionRef: 'ABA-TRX-882910',
        wishes: 'Happy Wedding Day!',
        recordedBy: clerk2.id,
      }),
    );

    // Gift 3: Cash KHR
    await giftRepo.save(
      giftRepo.create({
        weddingId: wedding.id,
        guestId: sampleGuests[2].id,
        guestNameSnapshot: sampleGuests[2].name,
        amount: 200000,
        currency: GiftCurrency.KHR,
        paymentMethod: PaymentMethod.CASH,
        wishes: 'សូមជូនពរឱ្យមានសុភមង្គលជារៀងរហូត!',
        recordedBy: clerk1.id,
      }),
    );

    console.log('🎁 Created initial sample gifts (Cash & QR in USD & KHR).');
  }

  console.log('\n🎉 Database seeding finished successfully!');
  console.log('--------------------------------------------------');
  console.log('👉 Couple Login: owner@wedding.com / password123');
  console.log('👉 Clerk 1 Login: clerk1@wedding.com / password123');
  console.log('👉 Clerk 2 Login: clerk2@wedding.com / password123');
  console.log('--------------------------------------------------');

  await dataSource.destroy();
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
