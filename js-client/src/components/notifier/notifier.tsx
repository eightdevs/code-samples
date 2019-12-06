import React from "react";
import { withSnackbar, WithSnackbarProps } from "notistack";
import { connect }  from "react-redux";
import { IRootReduxState, ISnackbarReduxState } from "../../reducers/interface";
import { Button } from "@material-ui/core";
import { dismissSnackbar, closeSnackbar } from "../../actions/creators/snackbar";
import { Dispatch } from "redux";

interface INotifierProps {
  messages: ISnackbarReduxState;
  closeMessage: (k: string) => any;
  dismissMessage: (k: string) => any;
}

class Notifier extends React.Component<INotifierProps & WithSnackbarProps> {

  private displayed: string[] = [];

  componentDidMount() {
    this.displayed = [];
  }

  componentDidUpdate() {
    const { messages, enqueueSnackbar, closeSnackbar, closeMessage, dismissMessage } = this.props;
    for (const [key, { message, variant }] of Object.entries(messages)) {
      if (this.displayed.indexOf(key) !== -1) { continue; }
      enqueueSnackbar(message, {
        key,
        variant,
        autoHideDuration: 3000,
        action: (k: string) => (
          <Button onClick={() => {
            closeSnackbar(k);
            dismissMessage(k);
          }}>dismiss</Button>
        ),
        onClose: (event: React.SyntheticEvent<any, Event>, reason: string, key?: string) => {
          if (key) {
            closeMessage(key);
          }
        }
      });  
      this.displayed.push(key);
      this.displayed = this.displayed.filter((v, i, s) => s.indexOf(v) === i)
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state: IRootReduxState) => ({ 
  messages: state.snackbar,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  closeMessage: (key: string) => dispatch(closeSnackbar(key)),
  dismissMessage: (p: string) => dispatch(dismissSnackbar(p)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withSnackbar(Notifier));
