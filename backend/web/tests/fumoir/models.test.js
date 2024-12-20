const moment=require('moment')
const mongoose = require('mongoose')
const {forceDataModelFumoir}=require('../utils')
forceDataModelFumoir()
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')

const Album=require('../../server/models/Album')
const Appointment=require('../../server/models/Appointment')
const Availability=require('../../server/models/Availability')
const Billing=require('../../server/models/Billing')
const Booking=require('../../server/models/Booking')
const Category=require('../../server/models/Category')
const ChatRoom=require('../../server/models/ChatRoom')
const Cigar=require('../../server/models/Cigar')
const CigarCategory=require('../../server/models/CigarCategory')
const Commission=require('../../server/models/Commission')
const Company=require('../../server/models/Company')
const Contact=require('../../server/models/Contact')
const Conversation=require('../../server/models/Conversation')
const Drink=require('../../server/models/Drink')
const DrinkCategory=require('../../server/models/DrinkCategory')
const Equipment=require('../../server/models/Equipment')
const Event=require('../../server/models/Event')
const EventLog=require('../../server/models/EventLog')
const FilterPresentation=require('../../server/models/FilterPresentation')
const Group=require('../../server/models/Group')
const Guest=require('../../server/models/Guest')
const Job=require('../../server/models/Job')
const LoggedUser=require('../../server/models/LoggedUser')
const Meal=require('../../server/models/Meal')
const MealCategory=require('../../server/models/MealCategory')
const Measure=require('../../server/models/Measure')
const Message=require('../../server/models/Message')
const Newsletter=require('../../server/models/Newsletter')
const OrderItem=require('../../server/models/OrderItem')
const Payment=require('../../server/models/Payment')
const Post=require('../../server/models/Post')
const Prestation=require('../../server/models/Prestation')
const PriceList=require('../../server/models/PriceList')
const Product=require('../../server/models/Product')
const Program=require('../../server/models/Program')
const Quotation=require('../../server/models/Quotation')
const Reminder=require('../../server/models/Reminder')
const ResetToken=require('../../server/models/ResetToken')
const Resource=require('../../server/models/Resource')
const Review=require('../../server/models/Review')
const Service=require('../../server/models/Service')
const ServiceUser=require('../../server/models/ServiceUser')
const Session=require('../../server/models/Session')
const ShipRate=require('../../server/models/ShipRate')
const Shop=require('../../server/models/Shop')
const Theme=require('../../server/models/Theme')
const TrainingCenter=require('../../server/models/TrainingCenter')
const UIConfiguration=require('../../server/models/UIConfiguration')
const User=require('../../server/models/User')
const UserSessionData=require('../../server/models/UserSessionData')

jest.setTimeout(20000)

describe('Test virtual single ref', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must know required models', async() => {
    expect(Album).toBeNull()
    expect(Appointment).toBeNull()
    expect(Availability).toBeNull()
    expect(Billing).toBeNull()
    expect(Booking).toBeTruthy()
    expect(Category).toBeTruthy()
    expect(ChatRoom).toBeNull()
    expect(Cigar).toBeTruthy()
    expect(CigarCategory).toBeTruthy()
    expect(Commission).toBeNull()
    expect(Company).toBeTruthy()
    expect(Contact).toBeNull()
    expect(Conversation).toBeTruthy()
    expect(Drink).toBeTruthy()
    expect(DrinkCategory).toBeTruthy()
    expect(Equipment).toBeNull()
    expect(Event).toBeTruthy()
    expect(EventLog).toBeFalsy()
    expect(FilterPresentation).toBeNull()
    expect(Group).toBeNull()
    expect(Guest).toBeTruthy()
    expect(Job).toBeNull()
    expect(LoggedUser).toBeTruthy()
    expect(Meal).toBeTruthy()
    expect(MealCategory).toBeTruthy()
    expect(Measure).toBeNull()
    expect(Message).toBeTruthy()
    expect(Newsletter).toBeNull()
    expect(OrderItem).toBeTruthy()
    expect(Payment).toBeTruthy()
    expect(Post).toBeTruthy()
    expect(Prestation).toBeNull()
    expect(PriceList).toBeNull()
    expect(Product).toBeTruthy()
    expect(Program).toBeNull()
    expect(Quotation).toBeNull()
    expect(Reminder).toBeNull()
    expect(ResetToken).toBeTruthy()
    expect(Resource).toBeNull()
    expect(Review).toBeTruthy()
    expect(Service).toBeNull()
    expect(ServiceUser).toBeNull()
    expect(Session).toBeNull()
    expect(ShipRate).toBeNull()
    expect(Shop).toBeNull()
    expect(Theme).toBeNull()
    expect(TrainingCenter).toBeNull()
    expect(UIConfiguration).toBeNull()
    expect(User).toBeTruthy()
    expect(UserSessionData).toBeTruthy()
  })
})
