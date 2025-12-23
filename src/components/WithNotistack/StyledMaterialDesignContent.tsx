import { MaterialDesignContent } from "notistack";
import styled from "styled-components";

const StyledMaterialDesignContent = styled(MaterialDesignContent)`
  &.notistack-MuiContent-success {
    background-color: #8bb236;
  }
  &.notistack-MuiContent-error {
    background-color: #b63170;
  }
  &.notistack-MuiContent-warning {
    background-color: #005a3a;
  }
  &.notistack-MuiContent-info {
    background-color: #318ac6;
  }
`;

const componentStyledNotistack = {
  success: StyledMaterialDesignContent,
  error: StyledMaterialDesignContent,
};

export { componentStyledNotistack };
