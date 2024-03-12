import { getSubjects } from "@/api/subjectsAPI";
import Graphin, { GraphinData, Behaviors, Utils } from "@antv/graphin";
import { MiniMap } from "@antv/graphin-components";
import { useQuery, useQueryClient } from "react-query";
import SearchPrelations from "./Search-Prelations";
import React from "react";

import  iconLoader  from "@antv/graphin-icons";
import '@antv/graphin-icons/dist/index.css';

const {fontFamily , glyphs} = iconLoader();

const icons = Graphin.registerFontFamily(iconLoader);


const { ActivateRelations } = Behaviors;

export default function Graph() {

  const { data, isLoading, error } = useQuery<Graph<Subject>>(
    ["subjects", "Ingeniería en Sistemas"],
    getSubjects
  );

  if (error) return React.createElement('div', null, 'Error');



  if (isLoading || !data) return React.createElement('div', null, 'Loading...');

  const graph: GraphinData = {
    nodes:
    data.Nodes!.map((node) => ({
      id: node.Id,
      label: node.Data.Name,
      data: node,
      style: {
            label: {
              value: node.Data.Name,
              fill: "white",
            },
        status: {
           start: {
            
            halo: {
              visible: true,
              fill: "blue",
            },

  
          },

          
        },
        icon: {
          type: "font",
          fontFamily: fontFamily,
          value: icons.compass,
          fill: "green",
          size: 20,
        },


      
        
      },
    })),
    edges: data.Edges!.map((edge) => ({
      source: edge.From,
      target: edge.To,
      style: {
        status: {
          prelation: {
            keyshape: {
              stroke: "blue",
            },
            halo: {
              fill: "#ddd",
              visible: true,
            },
          },
          future: {
            keyshape: {
              stroke: "red",
            },
            halo: {
              fill: "#ddd",
              visible: true,
            },
          },
        },
      },
    })),
  };
  console.log(graph);

  return (
    <Graphin
      data={graph}
      // width={undefined}
      // height={undefined}
      style={{
        backgroundColor: "transparent",
      }}
    >
      {/* <ActivateRelations trigger="click" /> */}
      <SearchPrelations />
      <MiniMap
        visible={true}
        style={{
          border: "1px solid #e2e2e2",
          borderRadius: 4,
        }}
        options={{
          className:
            "fixed bottom-4 right-4 border-2 border-white rounded-lg bg-white",
        }}
      />
    </Graphin>
  );
}
