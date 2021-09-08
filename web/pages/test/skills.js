import {withTranslation} from 'react-i18next'
const {setAxiosAuthentication}=require('../../utils/authentication')
import React from 'react'
import axios from 'axios'




import Select from 'react-dropdown-select';
import Skills from '../../components/Skills/Skills'
import Layout from '../../hoc/Layout/Layout'
import Input from '@material-ui/core/Input';

class SkillsTest extends React.Component{

  constructor(props) {
    super(props);
    this.state={
      users:[],
    }
  }

  componentDidMount() {
    setAxiosAuthentication()
    axios.get(`/myAlfred/api/admin/users/all_light`)
      .then(response => {
        let users = response.data;
        users = users.map(u => {
          return {
            label: `${u.name} ${u.firstname} ${u.email}`,
            value: u.email,
            key: u.id,
          };
        });
        this.setState({users: users});

      })
      .catch(err => {
        console.error(err);
      });
  }

  onUserChanged = e => {
    this.setState({user: e[0].key});
    console.log(e[0].key)
  };

  render() {
    const{classes} = this.props;
    const {users, user} = this.state

    return(
      <>
      <Select
        input={<Input name="user" id="genre-label-placeholder"/>}
        displayEmpty
        name="user"
        onChange={this.onUserChanged}
        options={users}
        multi={false}
      >
      </Select>

      <Skills key={this.state.user} alfred={this.state.user}/>
      </>
    );
  }

}

export default withTranslation('custom', {withRef: true})(SkillsTest)
