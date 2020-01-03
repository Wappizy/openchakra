import React, { Fragment } from "react";
import Link from "next/link";
import Layout from "../hoc/Layout/Layout";
import axios from "axios";
import moment from "moment";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Router from "next/router";
import { withStyles } from "@material-ui/core/styles";
import Footer from "../hoc/Layout/Footer/Footer";
import dynamic from "next/dynamic";

moment.locale("fr");
const _ = require("lodash");
const { config } = require("../config/config");
const url = config.apiUrl;
const MapComponent = dynamic(() => import("../components/map"), {
  ssr: false
});
const styles = theme => ({
  bigContainer: {
    flexGrow: 1
  },
  grosHR: {
    height: "7px",
    backgroundColor: "#6ec1e4",
    width: "76%",
    float: "left"
  },
  fournitureHR: {
    height: "5px",
    backgroundColor: "#6ec1e4",
    width: "85%",
    float: "left"
  },
  disponibilityHR: {
    height: "5px",
    backgroundColor: "#6ec1e4",
    width: "103%",
    float: "left"
  },
  conditionsHR: {
    height: "5px",
    backgroundColor: "#6ec1e4",
    width: "189%",
    float: "left"
  },
  perimeterHR: {
    height: "5px",
    backgroundColor: "#6ec1e4",
    width: "223%",
    float: "left"
  },
  dispocard: {
    minHeight: "100px",
    width: "200px",
    textAlign: "center",

    boxShadow: "4px 4px 41px -37px rgba(0,0,0,0.0)",
    border: "solid 1px #ccc",
    borderRadius: "10px"
  },
  dispocardin: {
    padding: "1%",
    fontSize: "17px",
    fontWeight: "bold",
    marginBottom: 10
  },

  prestationlist: {
    padding: "1%",

    marginBottom: 10,
    border: "solid 1px #ccc",
    borderRadius: "5px"
  },
  prestationside: {
    backgroundColor: "transparent",
    Border: "0px #ccc solid",
    borderRadius: "10px",
    marginRight: "10px",
    marginLeft: "10px",
    height: "30px"
  },

  dispoheader: {
    height: "2%",
    color: "white",
    width: "100%",
    padding: "1%",

    fontSize: "15px",
    textAlign: "center",

    borderRadius: "0px",
    backgroundColor: "#F8727F",
    marginBottom: "20px"
  }
});

const Input2 = ({ value, onClick }) => (
  <Button
    value={value}
    color={"inherit"}
    variant={"outlined"}
    style={{ color: "gray" }}
    className="example-custom-input"
    onClick={onClick}
  >
    {value}
  </Button>
);

class ConfirmPayement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      currentUser: null,
      emitter: null,
      recipient: null,
      bookingObj: null,
      city: null,
      address: null,
      zip_code: null,
      prestations: [],
      totalPrice: 0,
      total: null,
      fees: null,
      grandTotal: null,
      checkedOption: false,
      optionPrice: null,
      date: Date.now(),
      hour: Date.now()
    };
  }

  static getInitialProps({ query: { id } }) {
    return { shop_id: id };
  }

  componentDidMount() {
    const prestations = JSON.parse(localStorage.getItem("prestations"));
    const bookingObj = JSON.parse(localStorage.getItem("bookingObj"));

    axios.defaults.headers.common["Authorization"] = localStorage.getItem(
      "token"
    );

    axios.get(url + "myAlfred/api/users/current").then(res => {
      this.setState({ currentUser: res.data });
    });

    this.setState({
      emitter: localStorage.getItem("emitter"),
      recipient: localStorage.getItem("recipient"),
      prestations: bookingObj.prestations,
      bookingObj: bookingObj,
      city: bookingObj.address.city,
      address: bookingObj.address.address,
      zip_code: bookingObj.address.zip_code,
      date: bookingObj.date_prestation,
      hour: bookingObj.time_prestation,
      fees: bookingObj.fees,
      grandTotal: bookingObj.amount
    });
    const id = this.props.shop_id;
    localStorage.setItem("path", Router.pathname);
    axios.defaults.headers.common["Authorization"] = localStorage.getItem(
      "token"
    );

    axios.get(url + "myAlfred/api/serviceUser/" + id).then(res => {
      this.setState({ user: res.data.user });
    });
  }

  onChange(event, price) {
    let sumArr = [];
    let dummyState = [...this.state.selectedPrestations];
    let fees = null;
    let total = null;
    let grandTotal = null;
    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    const index = _.findIndex(dummyState, function(p) {
      return p.name === event.target.name;
    });
    if (index === -1)
      dummyState.push({
        name: event.target.name,
        value: event.target.value,
        price: price
      });
    if (index !== -1) {
      dummyState[index].value = event.target.value;
    }

    dummyState = _.filter(dummyState, function(f) {
      return f.value !== "";
    });
    this.setState({ selectedPrestations: dummyState });

    dummyState.map(prestation => {
      sumArr.push(prestation.price * prestation.value);
    });

    if (!_.isEmpty(sumArr)) {
      fees = 0.09 * (sumArr.reduce(reducer) + this.state.optionPrice);
      fees = parseFloat(fees.toFixed(2));


      this.setState({ total: sumArr.reduce(reducer) + this.state.optionPrice });
      this.setState({ fees: fees });

      grandTotal = sumArr.reduce(reducer) + fees;

      this.setState({ grandTotal: grandTotal + this.state.optionPrice });
    } else {
      this.setState({ total: null + this.state.optionPrice });
      this.setState({ fees: null });
      this.setState({ grandTotal: null + this.state.optionPrice });
    }
  }

  async handleCheckedOption(price) {
    await this.setState({ checkedOption: !this.state.checkedOption });

    if (this.state.checkedOption === true) {
      let feesTrue = 0.09 * (this.state.total + price);
      feesTrue = parseFloat(feesTrue.toFixed(2));

      let grandTotalTrue = this.state.total + price + feesTrue;
      grandTotalTrue = parseFloat(grandTotalTrue.toFixed(2));
      this.setState({ fees: feesTrue });
      this.setState({ optionPrice: price });
      this.setState({ grandTotal: grandTotalTrue });
    }
    if (this.state.checkedOption === false) {
      let feesFalse = 0.09 * this.state.total;
      feesFalse = parseFloat(feesFalse.toFixed(2));

      let grandTotalFalse = this.state.total + feesFalse;
      grandTotalFalse = parseFloat(grandTotalFalse.toFixed(2));
      this.setState({ fees: feesFalse });
      this.setState({ optionPrice: null });
      this.setState({ grandTotal: grandTotalFalse });
    }
  }

  handlePay() {
    localStorage.setItem("emitter", this.state.emitter);
    localStorage.setItem("recipient", this.state.recipient);
    Router.push({
      pathname: "/paymentChoiceCreate",
      query: { total: this.state.grandTotal, fees: this.state.fees }
    })
  }

  render() {
    const { classes } = this.props;
    const { user } = this.state;
    const { bookingObj, currentUser } = this.state;

    return (
      <Fragment>
        {user === null || currentUser === null ? null : (
          <>
            <Layout>
              <Grid container className={classes.bigContainer}>
                <Grid container>
                  <br></br>
                  <Grid
                    item
                    md={5}
                    xs={12}
                    style={{
                      textAlign: "left",
                      margin: "0 auto",
                      float: "right",
                      paddingLeft: "3%"
                    }}
                  >
                    <div
                      style={{
                        margin: "20px 11%",
                        marginTop: "5%",
                        width: "90%"
                      }}
                    ></div>
                    <Grid container>
                      <Grid
                        item
                        xs={12}
                        style={{ marginTop: 50, marginBottom: 30 }}
                      >
                        <h2
                          style={{
                            fontSize: "2rem",
                            color: "rgba(84,89,95,0.95)",
                            letterSpacing: -1,
                            fontWeight: "100"
                          }}
                        >
                          Détail de votre réservation
                        </h2>
                      </Grid>
                    </Grid>
                    <br></br>
                    <Grid container>
                      <Grid item xs={5} style={{}}>
                        <img
                          src={`../../${user.picture}`}
                          style={{
                            borderRadius: "50%",
                            marginLeft: "auto",
                            marginRight: "auto",
                            zIndex: 501,
                            minWidth: "137px",
                            maxWidth: "137px",
                            maxHeight: "137px",
                            minHeight: "137px"
                          }}
                          alt={"picture"}
                        />
                      </Grid>

                      <Grid item xs={5} style={{}}>
                        <h3
                          style={{
                            fontSize: "1.6rem",
                            color: "rgba(84,89,95,0.95)",
                            letterSpacing: -1,
                            fontWeight: "bold"
                          }}
                        >
                          A propos de {user.firstname}
                        </h3>

                        <div style={{ marginLeft: "3%" }}>
                          {Math.round(user.score) === 0 ? (
                            <>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                            </>
                          ) : Math.round(user.score) === 1 ? (
                            <>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                            </>
                          ) : Math.round(user.score) === 2 ? (
                            <>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                            </>
                          ) : Math.round(user.score) === 3 ? (
                            <>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                            </>
                          ) : Math.round(user.score) === 4 ? (
                            <>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-regular.png"
                              ></img>
                            </>
                          ) : Math.round(user.score) === 5 ? (
                            <>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                              <img
                                style={{
                                  width: "20px",
                                  marginRight: "3px",
                                  marginBottom: "5px"
                                }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                            </>
                          ) : (
                            <p>Erreur lors du chargement du score</p>
                          )}

                          <Grid style={{ marginLeft: "4%" }} container>
                            <Grid item xs={2}>
                              <img
                                style={{ width: "15px" }}
                                src="../../static/stars/star-solid.png"
                              ></img>
                            </Grid>
                            <Grid item xs={10}>
                              <Typography
                                style={{
                                  color: "rgb(47, 188, 211)",
                                  fontSize: "0.8rem",
                                  marginLeft: "-5%",
                                  cursor: "pointer"
                                }}
                              >
                                {user.number_of_reviews} Commentaires
                              </Typography>
                            </Grid>

                            {user.id_confirmed === true ? (
                              <>
                                <Grid item xs={2}>
                                  <img
                                    style={{ width: "15px" }}
                                    src="../../static/statut/oui.png"
                                  ></img>
                                </Grid>
                                <Grid item xs={10}>
                                  <Typography
                                    style={{
                                      fontSize: "0.8rem",
                                      marginLeft: "-5%"
                                    }}
                                  >
                                    Pièce d’identité vérifiée
                                  </Typography>
                                </Grid>
                              </>
                            ) : null}

                            <Grid item xs={2}>
                              <img
                                style={{ width: "15px" }}
                                src="../../static/statut/calendar.png"
                              ></img>
                            </Grid>
                            <Grid item xs={10}>
                              <Typography
                                style={{
                                  fontSize: "0.8rem",
                                  marginLeft: "-5%"
                                }}
                              >
                                Membre depuis le{" "}
                                {moment(user.creation_date).format(
                                  "DD/MM/YYYY"
                                )}
                              </Typography>
                            </Grid>

                            {user.is_alfred === true &&
                            currentUser.is_alfred === true ? (
                              <>
                                <Grid item xs={2}>
                                  <img
                                    style={{ width: "15px" }}
                                    src="../../static/statut/beaver.png"
                                  ></img>
                                </Grid>
                                <Grid item xs={10}>
                                  <Typography
                                    style={{
                                      fontSize: "0.8rem",
                                      marginLeft: "-5%"
                                    }}
                                  >
                                    Il est également Alfred{" "}
                                  </Typography>
                                </Grid>
                              </>
                            ) : null}

                            <Grid item xs={2}>
                              <img
                                style={{ width: "15px" }}
                                src="../../static/statut/chat.png"
                              ></img>
                            </Grid>
                            <Grid item xs={10}>
                              <Typography
                                style={{
                                  fontSize: "0.8rem",
                                  marginLeft: "-5%"
                                }}
                              >
                                Langue:{" "}
                                {user.languages.length ? (
                                  user.languages.map(
                                    language => language + ", "
                                  )
                                ) : (
                                  <span>Français</span>
                                )}{" "}
                              </Typography>
                            </Grid>

                            {
                              <Link
                                href={{
                                  pathname: "../viewProfile",
                                  query: { id: user._id }
                                }}
                              >
                                <Typography
                                  style={{
                                    color: "rgb(47, 188, 211)",
                                    fontSize: "0.8rem",
                                    cursor: "pointer"
                                  }}
                                >
                                  Voir le profil
                                </Typography>
                              </Link>
                            }
                          </Grid>
                        </div>

                        <Grid item xs={2} style={{}}></Grid>
                        <Grid item xs={10} style={{}}></Grid>
                      </Grid>
                    </Grid>

                    <div style={{ marginTop: "8%" }}>
                      <hr></hr>
                      <Grid container>
                        <h3
                          style={{
                            fontSize: "1.6rem",
                            color: "rgba(84,89,95,0.95)",
                            letterSpacing: -1,
                            fontWeight: "bold"
                          }}
                        >
                          A propos de votre réservation
                        </h3>
                        <Grid item xs={12} style={{}}>
                          <Grid
                            item
                            xs={3}
                            style={{
                              width: "30%",
                              float: "left",
                              paddingTop: 15
                            }}
                          >
                            <img
                              src="../../static/calendarreservation.svg"
                              width={"35%"}
                            />
                          </Grid>
                          <Grid item xs={9} style={{ width: "70%" }}>
                            <p>Date et heure de la prestation:</p>{" "}
                            <p>
                              {this.state.date} - {moment(this.state.hour).format('HH:mm')}
                            </p>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} style={{}}>
                          <Grid
                            item
                            xs={3}
                            style={{
                              width: "30%",
                              float: "left",
                              paddingTop: 15
                            }}
                          >
                            <img
                              src="../../static/mapmarker.svg"
                              width={"35%"}
                            />
                          </Grid>
                          <Grid item xs={9} style={{ width: "70%" }}>
                            <p>Adresse de la prestation:</p>{" "}
                            <p>
                              {this.state.address}, {this.state.city}{" "}
                              {this.state.zip_code}.
                            </p>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12} style={{}}>
                          <h3
                            style={{
                              fontSize: "1.6rem",
                              color: "rgba(84,89,95,0.95)",
                              letterSpacing: -1,
                              fontWeight: "bold"
                            }}
                          >
                            Paiement
                          </h3>
                          <Grid xs={12}>
                            {this.state.prestations.length
                              ? this.state.prestations.map(prestation => {
                                  return (
                                    <>
                                      <Grid
                                        item
                                        xs={9}
                                        style={{ width: "90%", float: "left" }}
                                      >
                                        <p>
                                          {prestation.value}X {prestation.name}
                                        </p>
                                      </Grid>
                                      <Grid
                                        item
                                        xs={3}
                                        style={{ width: "10%", float: "right" }}
                                      >
                                        <p>
                                          {prestation.price * prestation.value}€
                                        </p>
                                      </Grid>
                                    </>
                                  );
                                })
                              : null}

                            {/*<Grid item xs={9} style={{width:'90%', float:'left'}}><p>Supplément Cheveux long</p></Grid>
                                    <Grid item xs={3} style={{width:'10%', float:'right'}}> <p>5€</p></Grid>*/}

                            <br></br>

                            <Grid
                              item
                              xs={9}
                              style={{ width: "90%", float: "left" }}
                            >
                              <p>Frais de service</p>
                            </Grid>
                            <Grid
                              item
                              xs={3}
                              style={{ width: "10%", float: "right" }}
                            >
                              {" "}
                              <p>{this.state.fees}€</p>
                            </Grid>
                            <Grid
                              item
                              xs={9}
                              style={{
                                width: "90%",
                                float: "left",
                                fontSize: 25,
                                fontWeight: 600,
                                color: "#2FBCD3"
                              }}
                            >
                              <p>Total</p>
                            </Grid>
                            <Grid
                              item
                              xs={3}
                              style={{
                                width: "10%",
                                float: "right",
                                fontWeight: 600,
                                fontSize: 25,
                                color: "#2FBCD3"
                              }}
                            >
                              {" "}
                              <p>{this.state.grandTotal}€</p>
                              <Grid style={{ float: "right" }} item xs={12}>
                                {" "}
                                <Button
                                  color={"secondary"}
                                  variant={"contained"}
                                  style={{
                                    color: "white",
                                    fontSize: "16px",
                                    width: "100%",
                                    paddingLeft: "20px",
                                    paddingRight: "20px",
                                    marginBottom: 50,
                                    marginRight: 20
                                  }}
                                  onClick={() => {
                                    this.handlePay();
                                  }}
                                >
                                  Payer
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </div>

                    {/*cadre avec couleur et checkbox*/}
                  </Grid>

                  {/*Contenu à droite*/}
                  <Grid
                    item
                    xs={12}
                    md={7}
                    style={{ marginTop: "2%", marginBottom: "5%" }}
                  >
                    <Grid
                      container
                      style={{
                        backgroundImage: `url('../../static/resa.svg')`,
                        backgroundPosition: "cover",
                        backgroundRepeat: "no-repeat",
                        border: "thin solid transparent",
                        maxWidth: "100%",
                        height: "90vh",
                        padding: "2%",
                        position: "sticky",
                        top: 100
                      }}
                    ></Grid>{" "}
                  </Grid>
                </Grid>{" "}
              </Grid>
            </Layout>
            <Footer />
          </>
        )}
      </Fragment>
    );
  }
}

export default withStyles(styles)(ConfirmPayement);
