interface User {
  id: number;
  name: string;
}

interface Course {
  id: number;
  userId: number;
  title: string;
  description: string;
}

interface Booking {
  id: number;
  userId: number;
  courseId: number;
  date: Date;
}

interface Repository<T extends { id: number }> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  createItem(payload: T): Promise<void>;
  updateItem(payload: T): Promise<void>;
  deleteById(id: number): Promise<void>;
  findByFilter(filter: Partial<T>): Promise<T[]>;
}

class BaseRepository<T extends { id: number }> implements Repository<T> {
  protected items: T[] = [];

  constructor(initialData: T[] = []) {
    this.items = initialData;
  }

  async findAll(): Promise<T[]> {
    return this.items;
  }

  async findById(id: number): Promise<T | null> {
    const item = this.items.find(item => item.id === id);
    return item ?? null;
  }

  async createItem(payload: T): Promise<void> {
    this.items.push(payload);
  }

  async updateItem(payload: T): Promise<void> {
    const index = this.items.findIndex(item => item.id === payload.id);
    if (index !== -1) {
      this.items[index] = payload;
    }
  }

  async deleteById(id: number): Promise<void> {
    this.items = this.items.filter(item => item.id !== id);
  }

  async findByFilter(filter: Partial<T>): Promise<T[]> {
    return this.items.filter(item =>
      Object.entries(filter).every(([key, value]) => {
        const itemValue = item[key as keyof T];
        if (itemValue instanceof Date && value instanceof Date) {
          return itemValue.getTime() === value.getTime();
        }
        return itemValue === value;
      })
    );
  }
}

class UserRepository extends BaseRepository<User> {
  constructor() {
    super([
      { id: 1, name: "Ali" },
      { id: 2, name: "Sara" }
    ]);
  }
}

class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super([
      { id: 1, userId: 1, title: "Math", description: "Basic Math" },
      { id: 2, userId: 2, title: "Physics", description: "Advanced Physics" }
    ]);
  }
}

class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super([
      { id: 1, userId: 1, courseId: 1, date: new Date("2025-07-01") },
      { id: 2, userId: 2, courseId: 2, date: new Date("2025-07-15") }
    ]);
  }
}

async function test() {
  const userRepo = new UserRepository();
  const courseRepo = new CourseRepository();
  const bookingRepo = new BookingRepository();

  console.log("All Users:", await userRepo.findAll());
  console.log("User with ID 1:", await userRepo.findById(1));

  await userRepo.createItem({ id: 3, name: "Mona" });
  console.log("After Adding Mona:", await userRepo.findAll());

  await userRepo.updateItem({ id: 1, name: "Ali Updated" });
  console.log("After Updating Ali:", await userRepo.findAll());

  await userRepo.deleteById(2);
  console.log("After Deleting Sara:", await userRepo.findAll());

  const filtered = await userRepo.findByFilter({ name: "Mona" });
  console.log("Filtered Users (name = Mona):", filtered);

  console.log("All Courses:", await courseRepo.findAll());
  console.log("All Bookings:", await bookingRepo.findAll());

  // Example: filter bookings by date (works now!)
  const filteredBookings = await bookingRepo.findByFilter({ date: new Date("2025-07-01") });
  console.log("Bookings on 2025-07-01:", filteredBookings);
}

test();
