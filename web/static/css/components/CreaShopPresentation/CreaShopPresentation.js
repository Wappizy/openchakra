const Style = theme => ({
  policySizeTitle: {
    fontSize: 24,
    lineHeight: '1.25em',
    color: '#403f3f',
    margin: 0,
  },
  policySizeSubtitle: {
    color: '#403f3f',
    textTransform: 'uppercase',
  },
  policySizeContent: {
    color: '#403f3f',
  },
  titleContainer: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      justifyContent: 'center',
    },
  },

})
module.exports=Style
