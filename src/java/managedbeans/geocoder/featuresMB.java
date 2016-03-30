/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package managedbeans.geocoder;

import javax.faces.bean.ManagedBean;
import javax.faces.bean.ViewScoped;

/**
 *
 * @author nelson
 */
@ManagedBean
@ViewScoped
public class featuresMB {
    
    private boolean enableSelectedArea = false;
    
    
    /**
     * Creates a new instance of featuresMB
     */
    public featuresMB() {
    }
    
    public void changeState(){
        enableSelectedArea = true;
        System.out.println("VALUE "+ Boolean.toString(enableSelectedArea));
    }

    public boolean isEnableSelectedArea() {
        return enableSelectedArea;
    }

    public void setEnableSelectedArea(boolean enableSelectedArea) {
        this.enableSelectedArea = enableSelectedArea;
    }
    
}
